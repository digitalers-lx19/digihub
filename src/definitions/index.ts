export interface App {
    title: string;
    path: string;
}
export interface Game extends App {}
export interface Object {
    [key: string]: unknown;
}
export interface PublicMsg extends Object {
    room?: string;
}
export interface PrivateMsg extends Object {
    to: string;
}
export * from "./games/index.js"