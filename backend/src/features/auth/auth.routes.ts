import { Router } from 'express';
import { authController } from './auth.controller';
import { API_ROUTES } from 'shared';

const router = Router();

router.post(API_ROUTES.AUTH.LOGIN, (req, res, next) => authController.login(req, res, next));
router.post(API_ROUTES.AUTH.REGISTER, (req, res, next) => authController.register(req, res, next));

export const authRouter = router;
