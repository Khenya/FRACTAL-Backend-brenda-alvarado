import { ProductRepository } from '../repositories/product.repository.js';
import { ApiError } from '../config/errorHandler.js';

export class ProductService {
  constructor() {
    this.repository = new ProductRepository();
  }

  async getAll() {
    return await this.repository.findAll();
  }

  async getById(id) {
    const product = await this.repository.findById(id);
    if (!product) throw new ApiError('Producto no encontrado', 404);
    return product;
  }

  async create(data) {
    return await this.repository.create(data);
  }

  async update(id, data) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new ApiError('Producto no encontrado', 404);
    return await this.repository.update(id, data);
  }

  async delete(id) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new ApiError('Producto no encontrado', 404);
    await this.repository.delete(id);
  }
}
