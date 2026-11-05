import type { CardData, PlayerData, Rank, Suit } from "../definitions/index.js";
export const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const SUITS: Suit[] = ["spades", "hearts", "clubs", "diamonds"];
export const ORDER: Record<Rank, number> = {
    "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
    J: 11, Q: 12, K: 13, A: 14,
};
export const isRed = (suit: Suit) => suit === "hearts" || suit === "diamonds";
export class Card {
    constructor(public rank: Rank, public suit: Suit, public hidden = false) {}
    get id() { return `${this.suit}:${this.rank}`; }
    get order() { return ORDER[this.rank]; }
    get value() { return Math.min(10, this.order); }
    flip(hidden = !this.hidden) { this.hidden = hidden; return this; }
    toJSON(): CardData {
        return { id: this.id, rank: this.rank, suit: this.suit, value: this.value, hidden: this.hidden };
    }
}
export const buildDeck = <T extends Card>(create: (rank: Rank, suit: Suit) => T): T[] =>
    SUITS.flatMap((suit) => RANKS.map((rank) => create(rank, suit)));
export class Deck<T extends Card = Card> {
    cards: T[];
    constructor(cards: T[] = []) { this.cards = cards; }
    get size() { return this.cards.length; }
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        return this;
    }
    draw(count = 1) {
        if (count > this.cards.length) throw new Error("No hay cartas suficientes");
        return this.cards.splice(0, count);
    }
    drawOne() { return this.draw(1)[0]; }
    reset(cards: T[] = []) { this.cards = cards; return this; }
    toJSON() { return this.cards.map((card) => card.toJSON()); }
}
export class Player {
    hand: Card[] = [];
    bet = 0;
    folded = false;
    constructor(public id: string, public name: string, public chips = 1000) {}
    receive(cards: Card[]) { this.hand.push(...cards); return this; }
    discard() { this.hand = []; this.bet = 0; this.folded = false; }
    wager(amount: number) {
        const value = Math.max(0, Math.min(Math.floor(amount), this.chips));
        this.chips -= value;
        this.bet += value;
        return value;
    }
    win(amount: number) { this.chips += amount; return this; }
    toJSON(): PlayerData {
        return { id: this.id, name: this.name, chips: this.chips, bet: this.bet, folded: this.folded, hand: this.hand.map((card) => card.toJSON()) };
    }
}
