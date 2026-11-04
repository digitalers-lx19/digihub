import mongoose from "mongoose";
import { error } from "../utils/index.js";
export class Database {
    private static instance: Database | null = null;
    private URI:string = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/digihub';
    constructor(){
        mongoose.connect(this.URI)
            .then(conn => {
                const dbName = conn.connection.db?.databaseName;
                console.log(`database connected:`, dbName);
            })
            .catch(error.close)
    }
    getInstance(){
        return !Database.instance ?
        Database.instance = new Database() :
        Database.instance;
    }
    disconnect(){
        mongoose.disconnect();
    }
}