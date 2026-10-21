import mongoose from "mongoose";
export class Database {
    private instance: Database | null = null;
    private URI:string = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/digihub';
    constructor(){
        mongoose.connect(this.URI)
            .then(conn => {
                const dbName = conn.connection.db?.databaseName;
                console.log(`database connected:`, dbName);
            })
            .catch(err => { 
                console.error(`conection error:`, err.message); 
                process.exit(1);
            })
    }
    getInstance(){
        return !this.instance ? this.instance = new Database() : this.instance;
    }
    disconnect(){
        mongoose.disconnect();
    }
}