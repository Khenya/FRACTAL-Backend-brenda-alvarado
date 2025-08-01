import { pool } from '../config/db.js';

export class OrderRepository {
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0];
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
    await pool.query('UPDATE orders SET ? WHERE id = ?', [data, id]);
    return this.findById(id);
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
