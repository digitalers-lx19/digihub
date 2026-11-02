import { View } from "./Components/View.js";
import { Handler } from "./Components/Handler.js";
document.addEventListener('DOMContentLoaded', () => {
    new View().render();
    new Handler().bind();
})