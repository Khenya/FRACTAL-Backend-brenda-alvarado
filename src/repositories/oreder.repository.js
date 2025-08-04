import { pool } from '../config/db.js';

export class OrderRepository {
  async findById(id) {
    const { rows: orders } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orders.length === 0) return null;

    const { rows: products } = await pool.query(
      `SELECT op.product_id, op.quantity, op.total_price, p.name, p.unit_price
       FROM order_products op
       JOIN products p ON op.product_id = p.id
       WHERE op.order_id = $1`,
      [id]
    );

    return {
      ...orders[0],
      products,
    };
  }

  async create(data) {
    const { order_number, date, final_price, status = 'Pending', products = [] } = data;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const result = await client.query(
        'INSERT INTO orders (order_number, date, final_price, status) VALUES ($1, $2, $3, $4) RETURNING id',
        [order_number, date, final_price, status]
      );
      const orderId = result.rows[0].id;

      for (const item of products) {
        const quantity = parseInt(item.quantity) || 1;
        const productId = parseInt(item.product_id);

        const { rows: productRows } = await client.query(
          'SELECT unit_price FROM products WHERE id = $1',
          [productId]
        );

        if (productRows.length === 0) {
          throw new Error(`Producto ID ${productId} no existe`);
        }

        const totalPrice = parseFloat(productRows[0].unit_price) * quantity;

        await client.query(
          'INSERT INTO order_products (order_id, product_id, quantity, total_price) VALUES ($1, $2, $3, $4)',
          [orderId, productId, quantity, totalPrice]
        );
      }

      await client.query('COMMIT');
      return { id: orderId, order_number, date, final_price, status, products };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id, data) {
    const { products = [], order_number, date, final_price, status } = data;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE orders SET order_number = $1, date = $2, final_price = $3, status = $4 WHERE id = $5',
        [order_number, date, final_price, status, id]
      );

      await client.query('DELETE FROM order_products WHERE order_id = $1', [id]);

      for (const p of products) {
        const quantity = parseInt(p.quantity) || 1;
        const productId = parseInt(p.product_id);

        const { rows: productRows } = await client.query(
          'SELECT unit_price FROM products WHERE id = $1',
          [productId]
        );

        if (productRows.length === 0) throw new Error(`Producto ID ${productId} no existe`);

        const totalPrice = parseFloat(productRows[0].unit_price) * quantity;

        await client.query(
          'INSERT INTO order_products (order_id, product_id, quantity, total_price) VALUES ($1, $2, $3, $4)',
          [id, productId, quantity, totalPrice]
        );
      }

      await client.query('COMMIT');
      return await this.findById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async delete(id) {
    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
  }

  async updateStatus(id, status) {
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    return this.findById(id);
  }

  async findAllWithProductCount() {
    const { rows } = await pool.query(
      `SELECT o.*, COUNT(op.product_id) AS product_count
       FROM orders o
       LEFT JOIN order_products op ON o.id = op.order_id
       GROUP BY o.id`
    );
    return rows;
  }
}
