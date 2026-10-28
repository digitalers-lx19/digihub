import { config } from "dotenv";
import { App } from "./app.js";
import { Database } from "./config/index.js";
config();
const db = new Database();
const app = App();
export {
    db,
    app
}