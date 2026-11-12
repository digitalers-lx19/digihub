import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
export const getGames = () => {
    const appDir = resolve(process.cwd(), "public", "games");
    const entries = readdirSync(appDir, { withFileTypes: true });
    const games = entries
        .filter(entry => entry.isDirectory())
        // Un directorio sin index.html no es un juego servible: puede ser un
        // submódulo no inicializado (clon sin --recurse-submodules).
        .filter(entry => existsSync(resolve(appDir, entry.name, "index.html")))
        .map(entry => ({
            title: entry.name,
            path: `/games/${entry.name}/`
        }));
    return games;
};