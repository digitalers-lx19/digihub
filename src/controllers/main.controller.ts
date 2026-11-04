import type { Request, Response } from "express"
import { getGames } from "../services/games.service.js";

export const mainController = {
    getApps: (_:Request, res:Response) => res.json({
        appName: 'DigiHub',
        appList: getGames()
    }) 
}