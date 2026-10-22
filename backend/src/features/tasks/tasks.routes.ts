import { Router } from 'express';
import { taskController } from './tasks.controller';

const router = Router();

router.get('/', (req, res, next) => taskController.getAll(req, res, next));
router.get('/:id', (req, res, next) => taskController.getById(req, res, next));
router.post('/', (req, res, next) => taskController.create(req, res, next));
router.put('/:id', (req, res, next) => taskController.update(req, res, next));
router.delete('/:id', (req, res, next) => taskController.delete(req, res, next));

export const tasksRouter = router;
