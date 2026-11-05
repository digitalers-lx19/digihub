import type { Request, Response } from "express";
import { AuthError, login, signup } from "../services/auth.service.js";
const fail = (res: Response, error: unknown) => {
    if (error instanceof AuthError) return res.status(error.status).json({ message: error.message });
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
};
export const authController = {
    signup: async (req: Request, res: Response) => {
        try {
            const user = await signup(req.body ?? {});
            return res.status(201).json({ user });
        } catch (error) {
            return fail(res, error);
        }
    },
    login: async (req: Request, res: Response) => {
        try {
            const user = await login(req.body ?? {});
            return res.json({ user });
        } catch (error) {
            return fail(res, error);
        }
    },
};
