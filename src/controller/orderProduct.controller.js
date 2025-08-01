import { OrderProductService } from '../services/orderProduct.service.js';
import { successResponse } from '../config/successHandler.js';

export class OrderProductController {
  constructor() {
    this.service = new OrderProductService();
  }

  addProduct = async (req, res) => {
    const orderId = parseInt(req.params.id);
    const result = await this.service.addProduct(orderId, req.body);
    res.status(201).json(successResponse(result, 'Producto agregado a la orden'));
  };

  updateProduct = async (req, res) => {
    const orderId = parseInt(req.params.id);
    const productId = parseInt(req.params.pid);
    const result = await this.service.updateProduct(orderId, productId, req.body);
    res.json(successResponse(result, 'Producto de la orden actualizado'));
  };

  removeProduct = async (req, res) => {
    const orderId = parseInt(req.params.id);
    const productId = parseInt(req.params.pid);
    await this.service.removeProduct(orderId, productId);
    res.status(204).send();
  };
}
