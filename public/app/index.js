import { listGames } from "./Components/links.js";
import { Auth } from "./Components/auth.js";

document.addEventListener('DOMContentLoaded', () => {
    Auth();
    listGames();
})