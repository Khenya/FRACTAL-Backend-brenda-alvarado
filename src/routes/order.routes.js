import { Router } from 'express';
import { OrderController } from '../controller/order.controller.js';

const router = Router();
const controller = new OrderController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/status', controller.updateStatus);

export default router;