import { Deck } from './app/Components/Card.js'
(() => document.addEventListener('DOMContentLoaded', () => {
    const BJDeck = new Deck({});
    BJDeck.Shuffle();
}))()