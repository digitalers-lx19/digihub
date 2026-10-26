import fs from "node:fs";
import path from "node:path";

export const getGames = () => {
    const appDir = path.resolve(process.cwd(), "public", "app");
    if (!fs.existsPath(appDir)) {
        return [];
    }
    const entries = fs.readdirSync(appDir, { withFileTypes: true });
    const games = entries
        .filter(entry => entry.isDirectory())
        .map(entry => {
            return {
                title: entry.name,
                path: `/app/${entry.name}/`
            };
        });
    return games;
};
