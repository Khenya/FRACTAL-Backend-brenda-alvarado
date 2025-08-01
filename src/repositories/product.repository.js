import { pool } from '../config/db.js';

export class ProductRepository {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM products');
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  }

  async create(data) {
    const { name, unit_price } = data;
    const [result] = await pool.query(
      'INSERT INTO products (name, unit_price) VALUES (?, ?)',
      [name, unit_price]
    );
    return { id: result.insertId, ...data };
  }

  async update(id, data) {
    await pool.query('UPDATE products SET ? WHERE id = ?', [data, id]);
    return this.findById(id);
  }

  async delete(id) {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
  }
}