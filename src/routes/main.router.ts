import { Router } from "express";
import { mainController } from '../controllers/main.controller.js';
import { authRouter } from "./auth.router.js";
export const mainRouter = Router();
mainRouter.use('/auth', authRouter);
mainRouter.get('/', mainController.getApps);