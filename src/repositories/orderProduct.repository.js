import { pool } from "../config/db.js";
import { OrderProductRepository } from "./orderProductRepository.js";

export class OrderRepository {
  constructor() {
    this.orderProductRepo = new OrderProductRepository();
  }

  async findById(id) {
    const [orders] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (orders.length === 0) return null;

    const [products] = await pool.query(
      "SELECT product_id, quantity, total_price FROM order_products WHERE order_id = ?",
      [id]
    );

    return {
      ...orders[0],
      products,
    };
  }

  async update(id, data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { products = [], ...orderFields } = data;

      // 1. Actualiza campos de la orden
      await conn.query(
        "UPDATE orders SET order_number = ?, date = ?, final_price = ?, status = ? WHERE id = ?",
        [orderFields.order_number, orderFields.date, orderFields.final_price, orderFields.status, id]
      );


      // 2. Elimina productos actuales
      await conn.query("DELETE FROM order_products WHERE order_id = ?", [id]);

      // 3. Agrega nuevos productos
      for (const p of products) {
        const quantity = parseInt(p.quantity) || 1;
        const productId = parseInt(p.product_id);

        // Precio unitario desde la tabla de productos
        const [[product]] = await conn.query(
          "SELECT unit_price FROM products WHERE id = ?",
          [productId]
        );

        if (!product) throw new Error(`Producto ID ${productId} no existe`);

        const totalPrice = parseFloat(product.unit_price) * quantity;

        await conn.query(
          "INSERT INTO order_products (order_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)",
          [id, productId, quantity, totalPrice]
        );
      }

      await conn.commit();

      // 4. Devuelve orden actualizada
      return await this.findById(id);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}