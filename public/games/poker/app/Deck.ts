import { Card } from "./Card.js";
export class Deck {
    cards:Card[] = [];
    constructor({
            royal = [ "A", "J", "Q", "K"], 
            symbols = ["♠", "♥","♣","♦"],
        }){
        symbols.map((icon, idx) => Array.from({length:12}).map((_, i) => {
            this.cards.push(new Card({
                number: i,
                icon,
                color: idx % 2 ===  0 ? "black" : "red",
            }))
        }))
    }
    Shuffle(){
        const { length } = this.cards
        for (let i = length - 1; i > 0; i--) {
            const r = Math.floor(Math.random() * (i - 1));
            [ this.cards[i], this.cards[r] ] = [ this.cards[r], this.cards[i] ];
        }
        return this.cards
    }
}