import { OrderRepository } from '../repositories/oreder.repository.js';
import { ApiError } from '../config/errorHandler.js';

export class OrderService {
  constructor() {
    this.repository = new OrderRepository();
  }

  async getAllWithProductCount() {
    const orders = await this.repository.findAllWithProductCount();
    return orders.map(order => ({
      ...order,
      productCount: order.items.reduce((sum, item) => sum + item.quantity, 0)
    }));
  }

  async getById(id) {
    const order = await this.repository.findById(id);
    if (!order) throw new ApiError(`Orden con ID ${id} no encontrada`, 404);
    return order;
  }

  async create(data) {
    return await this.repository.create(data);
  }

  async update(id, data) {
    const exists = await this.repository.findById(id);
    if (!exists) throw new ApiError('Orden no encontrada', 404);

    return await this.repository.update(id, data);
  }

  async delete(id) {
    const exists = await this.repository.findById(id);
    if (!exists) throw new ApiError('Orden no encontrada', 404);

    await this.repository.delete(id);
  }

  async updateStatus(id, status) {
    const validStatus = ['Pending', 'InProgress', 'Completed'];
    if (!validStatus.includes(status)) {
      throw new ApiError('Estado inválido', 400);
    }

    const exists = await this.repository.findById(id);
    if (!exists) throw new ApiError('Orden no encontrada', 404);

    return await this.repository.updateStatus(id, status);
  }
}
