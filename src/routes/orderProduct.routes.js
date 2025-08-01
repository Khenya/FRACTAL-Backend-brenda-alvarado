import { Router } from 'express';
import { OrderProductController } from '../controller/orderProduct.controller.js';

const router = Router();
const controller = new OrderProductController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/status', controller.updateStatus);

export default router;