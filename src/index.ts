import { config } from "dotenv";
import { Database } from "./config/database.js";

config();
const dbConn = new Database();

export {
    dbConn,
}