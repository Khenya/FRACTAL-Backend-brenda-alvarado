import { OrderService } from '../services/order.service.js';
import { successResponse } from '../config/successHandler.js';

export class OrderController {
  constructor() {
    this.service = new OrderService();
  }

  getAll = async (req, res) => {
    const orders = await this.service.getAll();
    res.json(successResponse(orders));
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
