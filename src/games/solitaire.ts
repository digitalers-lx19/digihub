import type { CardData, SolitaireRoomState } from "../definitions/index.js";
import { buildDeck, Card, Deck, isRed, Player } from "./cards.js";
export class SolitaireCard extends Card {
    faceUp = false;
    flipFace(faceUp = !this.faceUp) { this.faceUp = faceUp; return this; }
    toJSON(): CardData {
        return { ...super.toJSON(), faceUp: this.faceUp, hidden: !this.faceUp };
    }
}
export class SolitaireDeck extends Deck<SolitaireCard> {
    constructor() { super(buildDeck((rank, suit) => new SolitaireCard(rank, suit))); }
}
export class SolitairePlayer extends Player {
    score = 0;
    moves = 0;
}
export interface PileRef { type: "tableau" | "foundation" | "waste"; index?: number; }
const foundationOrder = (card: Card) => (card.order === 14 ? 1 : card.order);
const isSequence = (cards: SolitaireCard[]) => cards.every((card, index) => index === 0
    || (cards[index - 1].order === card.order + 1 && isRed(cards[index - 1].suit) !== isRed(card.suit)));
export class SolitaireGame {
    player?: SolitairePlayer;
    deck = new SolitaireDeck();
    stock: SolitaireCard[] = [];
    waste: SolitaireCard[] = [];
    tableau: SolitaireCard[][] = Array.from({ length: 7 }, () => []);
    foundations: SolitaireCard[][] = Array.from({ length: 4 }, () => []);
    won = false;
    start(id: string, name: string) {
        this.player = new SolitairePlayer(id, name || "Jugador");
        this.deck = new SolitaireDeck().shuffle();
        this.waste = [];
        this.tableau = Array.from({ length: 7 }, () => []);
        this.foundations = Array.from({ length: 4 }, () => []);
        this.won = false;
        for (let column = 0; column < 7; column++) {
            for (let row = 0; row <= column; row++) {
                const card = this.deck.drawOne();
                card.flipFace(row === column);
                this.tableau[column].push(card);
            }
        }
        this.stock = this.deck.cards.splice(0);
        this.player.moves = 0;
        this.player.score = 0;
    }
    draw(id: string) {
        this.require(id);
        if (!this.stock.length && !this.waste.length) return;
        if (!this.stock.length) {
            this.stock = this.waste.splice(0).reverse();
            for (const card of this.stock) card.flipFace(false);
        } else {
            this.waste.push(this.stock.pop()!.flipFace(true));
        }
        this.player!.moves++;
        this.updateScore();
    }
    move(id: string, from: PileRef, to: PileRef, cardId?: string) {
        this.require(id);
        if (to.type !== "tableau" && to.type !== "foundation") throw new Error("Destino inválido");
        const cards = this.take(from, cardId);
        if (!cards) throw new Error("Movimiento inválido");
        if (!this.canPlace(cards, to)) {
            this.restore(from, cards);
            throw new Error("No se puede colocar ahí");
        }
        if (to.type === "foundation") this.foundations[to.index ?? 0].push(cards[0]);
        else this.tableau[to.index ?? 0].push(...cards);
        this.flipTop(from);
        this.player!.moves++;
        this.updateScore();
    }
    private require(id: string) {
        if (!this.player || this.player.id !== id) throw new Error("Jugador inválido");
    }
    private take(from: PileRef, cardId?: string): SolitaireCard[] | null {
        if (from.type === "waste") {
            const card = this.waste[this.waste.length - 1];
            if (!card || (cardId && card.id !== cardId)) return null;
            return this.waste.splice(-1, 1);
        }
        if (from.type === "foundation") {
            const pile = this.foundations[from.index ?? 0];
            const card = pile[pile.length - 1];
            if (!card || (cardId && card.id !== cardId)) return null;
            return pile.splice(-1, 1);
        }
        const pile = this.tableau[from.index ?? 0];
        const index = pile.findIndex((card) => card.id === cardId && card.faceUp);
        if (index < 0) return null;
        const cards = pile.slice(index);
        if (!isSequence(cards)) return null;
        pile.splice(index);
        return cards;
    }
    private restore(from: PileRef, cards: SolitaireCard[]) {
        if (from.type === "waste") this.waste.push(...cards);
        else if (from.type === "foundation") this.foundations[from.index ?? 0].push(...cards);
        else this.tableau[from.index ?? 0].push(...cards);
    }
    private canPlace(cards: SolitaireCard[], to: PileRef) {
        if (!cards.length) return false;
        if (to.type === "foundation") {
            const pile = this.foundations[to.index ?? 0];
            if (cards.length !== 1) return false;
            const top = pile[pile.length - 1];
            const expected = top ? foundationOrder(top) + 1 : 1;
            return cards[0].suit === (top?.suit ?? cards[0].suit) && foundationOrder(cards[0]) === expected;
        }
        const pile = this.tableau[to.index ?? 0];
        const top = pile[pile.length - 1];
        if (!top) return cards[0].order === 13;
        return top.order === cards[0].order + 1 && isRed(top.suit) !== isRed(cards[0].suit);
    }
    private flipTop(from: PileRef) {
        if (from.type !== "tableau") return;
        const pile = this.tableau[from.index ?? 0];
        const top = pile[pile.length - 1];
        if (top && !top.faceUp) top.flipFace(true);
    }
    private updateScore() {
        if (!this.player) return;
        const foundation = this.foundations.reduce((total, pile) => total + pile.length * 10, 0);
        const visible = this.tableau.flat().filter((card) => card.faceUp).length;
        this.player.score = foundation + visible;
        this.won = this.foundations.every((pile) => pile.length === 13);
        if (this.won) this.player.score += 100;
    }
    toJSON(room = ""): SolitaireRoomState {
        return {
            room,
            phase: this.won ? "won" : "playing",
            players: this.player ? [this.player.toJSON()] : [],
            tableau: this.tableau.map((pile) => pile.map((card) => card.toJSON())),
            foundations: this.foundations.map((pile) => pile.map((card) => card.toJSON())),
            stock: this.stock.length,
            waste: this.waste.map((card) => card.toJSON()),
            score: this.player?.score ?? 0,
            moves: this.player?.moves ?? 0,
            won: this.won,
        };
    }
}
