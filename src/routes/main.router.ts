import { Router } from "express";
import { mainController } from '../controllers/main.controller.js';
export const mainRouter = Router();
mainRouter.get('/', mainController.getApps);