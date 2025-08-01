import { ProductService } from '../services/product.service.js';
import { successResponse } from '../config/successHandler.js';

export class ProductController {
  constructor() {
    this.service = new ProductService();
  }

  getAll = async (req, res) => {
    const products = await this.service.getAll();
    res.json(successResponse(products));
  };

  getById = async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await this.service.getById(id);
    res.json(successResponse(product));
  };

  create = async (req, res) => {
    const product = await this.service.create(req.body);
    res.status(201).json(successResponse(product, 'Producto creado'));
  };

  update = async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await this.service.update(id, req.body);
    res.json(successResponse(product, 'Producto actualizado'));
  };

  delete = async (req, res) => {
    const id = parseInt(req.params.id);
    await this.service.delete(id);
    res.status(204).send();
  };
}