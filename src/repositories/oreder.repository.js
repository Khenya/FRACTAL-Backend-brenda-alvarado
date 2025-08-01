import { pool } from '../config/db.js';

export class OrderRepository {
  async findById(id) {
    const [orders] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (orders.length === 0) return null;

    const [products] = await pool.query(
      "SELECT op.product_id, op.quantity, op.total_price, p.name, p.unit_price FROM order_products op JOIN products p ON op.product_id = p.id WHERE op.order_id = ?",
      [id]
    );

    return {
      ...orders[0],
      products,
    };
  }

  async create(data) {
    const { order_number, date, final_price, status = 'Pending', products = [] } = data;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        'INSERT INTO orders (order_number, date, final_price, status) VALUES (?, ?, ?, ?)',
        [order_number, date, final_price, status]
      );

      const orderId = result.insertId;

      for (const item of products) {
        await conn.query(
          'INSERT INTO order_products (order_id, product_id, quantity) VALUES (?, ?, ?)',
          [orderId, item.product_id, item.quantity]
        );
      }

      await conn.commit();
      return { id: orderId, order_number, date, final_price, status, products };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async update(id, data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { products = [], order_number, date, final_price, status } = data;

      // 1. Actualiza los campos de la orden (sin incluir 'products')
      await conn.query(
        "UPDATE orders SET order_number = ?, date = ?, final_price = ?, status = ? WHERE id = ?",
        [order_number, date, final_price, status, id]
      );

      // 2. Elimina los productos existentes asociados a esta orden
      await conn.query("DELETE FROM order_products WHERE order_id = ?", [id]);

      // 3. Agrega los nuevos productos
      for (const p of products) {
        const quantity = parseInt(p.quantity) || 1;
        const productId = parseInt(p.product_id);

        // Obtén el precio unitario del producto
        const [[product]] = await conn.query(
          "SELECT unit_price FROM products WHERE id = ?",
          [productId]
        );

        if (!product) throw new Error(`Producto con ID ${productId} no existe`);

        const totalPrice = parseFloat(product.unit_price) * quantity;

        await conn.query(
          "INSERT INTO order_products (order_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)",
          [id, productId, quantity, totalPrice]
        );
      }

      await conn.commit();

      // 4. Retorna la orden actualizada con sus productos
      return await this.findById(id);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async delete(id) {
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);
  }

  async updateStatus(id, status) {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  }
  async findAllWithProductCount() {
    return prisma.order.findMany({
      include: {
        items: {
          select: { quantity: true },
        },
      },
    });
  }
}
