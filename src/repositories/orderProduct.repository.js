import { pool } from '../config/db.js';

export class OrderProductRepository {
  async add(orderId, { product_id, quantity, total_price }) {
    const [result] = await pool.query(
      'INSERT INTO order_products (order_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)',
      [orderId, product_id, quantity, total_price]
    );
    return { id: result.insertId, order_id: orderId, product_id, quantity, total_price };
  }

  async update(orderId, productId, data) {
    await pool.query(
      'UPDATE order_products SET ? WHERE order_id = ? AND product_id = ?',
      [data, orderId, productId]
    );
  }

  async remove(orderId, productId) {
    await pool.query(
      'DELETE FROM order_products WHERE order_id = ? AND product_id = ?',
      [orderId, productId]
    );
  }
}
