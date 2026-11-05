import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { User } from "../models/user.model.js";
const scrypt = promisify(scryptCallback) as (password: string, salt: string, length: number) => Promise<Buffer>;
const KEY_LENGTH = 64;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export class AuthError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "AuthError";
    }
}
export const hashPassword = async (password: string) => {
    const salt = randomBytes(16).toString("hex");
    const key = await scrypt(password, salt, KEY_LENGTH);
    return `${salt}:${key.toString("hex")}`;
};
export const verifyPassword = async (password: string, stored: string) => {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const key = await scrypt(password, salt, KEY_LENGTH);
    const expected = Buffer.from(hash, "hex");
    return expected.length === key.length && timingSafeEqual(expected, key);
};
export const sanitize = (user: any) => ({
    id: String(user._id ?? user.id ?? ""),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
});

export interface SignupData {
    name?: string;
    email?: string;
    password?: string;
}
export interface LoginData {
    email?: string;
    password?: string;
}
const credentials = (data: SignupData | LoginData) => ({
    email: String(data.email ?? "").trim().toLowerCase(),
    password: String(data.password ?? ""),
});
export const signup = async (data: SignupData) => {
    const name = String(data.name ?? "").trim();
    const { email, password } = credentials(data);
    if (name.length < 2) throw new AuthError(400, "El nombre debe tener al menos 2 caracteres");
    if (!EMAIL.test(email)) throw new AuthError(400, "El correo no es válido");
    if (password.length < 6) throw new AuthError(400, "La contraseña debe tener al menos 6 caracteres");
    if (await User.exists({ email })) throw new AuthError(409, "El correo ya está registrado");
    const user = await User.create({ name, email, password: await hashPassword(password) });
    return sanitize(user.toObject());
};
export const login = async (data: LoginData) => {
    const { email, password } = credentials(data);
    if (!email || !password) throw new AuthError(400, "Correo y contraseña son obligatorios");
    const user = await User.findOne({ email });
    if (!user || !(await verifyPassword(password, user.password))) {
        throw new AuthError(401, "Credenciales incorrectas");
    }
    return sanitize(user.toObject());
};
