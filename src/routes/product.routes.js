import { Router } from 'express';
import { ProductController } from '../controller/product.controller.js';

const router = Router();
const controller = new ProductController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update); 
router.delete('/:id', controller.delete);

export default router;