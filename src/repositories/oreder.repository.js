import { pool } from '../config/db.js';

export class OrderRepository {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM orders');
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0];
  }

  async create(data) {
    const { order_number, date, final_price, status = 'Pending' } = data;
    const [result] = await pool.query(
      'INSERT INTO orders (order_number, date, final_price, status) VALUES (?, ?, ?, ?)',
      [order_number, date, final_price, status]
    );
    return { id: result.insertId, ...data };
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
}
