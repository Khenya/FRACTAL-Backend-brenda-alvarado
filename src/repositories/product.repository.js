import { pool } from '../config/db.js';

export class ProductRepository {
  async findAll() {
    const result = await pool.query('SELECT * FROM products');
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
  }

  async create(data) {
    const { name, unit_price } = data;
    const result = await pool.query(
      'INSERT INTO products (name, unit_price) VALUES ($1, $2) RETURNING *',
      [name, unit_price]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { name, unit_price } = data;
    await pool.query(
      'UPDATE products SET name = $1, unit_price = $2 WHERE id = $3',
      [name, unit_price, id]
    );
    return this.findById(id);
  }

  async delete(id) {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
  }
}