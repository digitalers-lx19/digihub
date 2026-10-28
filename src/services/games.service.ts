import { readdirSync } from "node:fs";
import { resolve } from "node:path";
export const getGames = () => {
    const appDir = resolve(process.cwd(), "public", "games");
    const entries = readdirSync(appDir, { withFileTypes: true });
    const games = entries
        .filter(entry => entry.isDirectory())
        .map(entry => ({
            title: entry.name,
            path: `/games/${entry.name}/`
        }));
    return games;
};