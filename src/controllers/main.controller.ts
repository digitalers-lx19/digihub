import type { Request, Response } from "express"
export const mainController = {
    getApps: (_:Request, res:Response) => res.json({
        appName: 'DigiHub',
        appList: [
            { title: 'nodeDraw', path: '/app/nodeDraw/' },
            { title: 'tic-tac-toe', path: '/app/tictactoe/' }
        ]
    }) 
}