import { OrderService } from '../services/order.service.js';
import { successResponse } from '../config/successHandler.js';
import { pool as db } from '../config/db.js';

export class OrderController {
  constructor() {
    this.service = new OrderService();
  }

  getAll = async (req, res) => {
    try {
      const result = await db.query(`
        SELECT 
          o.*, 
          COALESCE(SUM(op.quantity), 0) AS product_count
        FROM orders o
        LEFT JOIN order_products op ON o.id = op.order_id
        GROUP BY o.id
      `);

      res.json(successResponse(result.rows));
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      res.status(500).json({ success: false, message: 'Error al obtener órdenes' });
    }
  };

  getById = async (req, res) => {
    const id = parseInt(req.params.id);
    const order = await this.service.getById(id);
    res.json(successResponse(order));
  };

  create = async (req, res) => {
    const newOrder = await this.service.create(req.body);
    res.status(201).json(successResponse(newOrder, 'Orden creada'));
  };

  update = async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await this.service.update(id, req.body);
    res.json(successResponse(updated, 'Orden actualizada'));
  };

  delete = async (req, res) => {
    const id = parseInt(req.params.id);
    await this.service.delete(id);
    res.status(204).send();
  };

  updateStatus = async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const updated = await this.service.updateStatus(id, status);
    res.json(successResponse(updated, 'Estado actualizado'));
  };
}
