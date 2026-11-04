import type { BlackjackPlayerData, BlackjackRoomState, CardData } from "../definitions/index.js";
import { buildDeck, Card, Deck, Player } from "./cards.js";
export class BlackjackCard extends Card {
    get value() { return this.order === 14 ? 11 : Math.min(10, this.order); }
}
export const handScore = (cards: Card[]) => {
    let total = cards.reduce((sum, card) => sum + card.value, 0);
    let aces = cards.filter((card) => card.order === 14).length;
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    return total;
};
export class BlackjackDeck extends Deck<BlackjackCard> {
    constructor(decks = 6) {
        super(Array.from({ length: decks }).flatMap(() => buildDeck((rank, suit) => new BlackjackCard(rank, suit))));
    }
}
export class BlackjackPlayer extends Player {
    status: "playing" | "stood" | "busted" | "blackjack" = "playing";
    result?: "win" | "lose" | "push" | "blackjack";
    get score() { return handScore(this.hand); }
    hit(card: BlackjackCard) {
        this.receive([card]);
        if (this.score > 21) this.status = "busted";
        else if (this.score === 21) this.status = "stood";
        return this;
    }
    stand() { this.status = "stood"; return this; }
    toJSON(): BlackjackPlayerData {
        return { ...super.toJSON(), status: this.status, score: this.score, result: this.result };
    }
}
export class BlackjackDealer extends Player {
    get score() { return handScore(this.hand); }
    toJSON(showHole = false): BlackjackPlayerData {
        return {
            ...super.toJSON(),
            status: "playing",
            score: this.score,
            hand: this.hand.map((card, index) => (index === 1 && !showHole ? hiddenCard() : card.toJSON())),
        };
    }
}
const hiddenCard = (): CardData => ({ id: "hidden", rank: "?", suit: "spades", value: 0, hidden: true });
export type BlackjackPhase = "waiting" | "playing" | "dealer" | "done";
export class BlackjackGame {
    players: BlackjackPlayer[] = [];
    deck = new BlackjackDeck();
    dealer = new BlackjackDealer("dealer", "Dealer", 0);
    phase: BlackjackPhase = "waiting";
    turn = 0;
    message = "Esperando jugadores";
    addPlayer(id: string, name: string) {
        const existing = this.players.find((player) => player.id === id);
        if (existing) return existing;
        if (this.phase !== "waiting" || this.players.length >= 6) throw new Error("La partida no acepta más jugadores");
        const player = new BlackjackPlayer(id, name || "Jugador");
        this.players.push(player);
        return player;
    }
    removePlayer(id: string) {
        this.players = this.players.filter((player) => player.id !== id);
        if (this.phase !== "waiting") this.phase = "waiting";
        this.turn = Math.min(this.turn, Math.max(0, this.players.length - 1));
    }
    start() {
        if (!this.players.length) throw new Error("Se necesita al menos 1 jugador");
        this.deck = new BlackjackDeck().shuffle();
        this.dealer.discard();
        this.dealer.receive(this.deck.draw(2));
        this.phase = "playing";
        this.turn = 0;
        this.message = "Turno del jugador";
        for (const player of this.players) {
            player.discard();
            player.wager(10);
            player.status = "playing";
            player.result = undefined;
            player.receive(this.deck.draw(2));
            if (player.score === 21) player.status = "blackjack";
        }
        this.advance();
    }
    hit(id: string) {
        const player = this.current();
        if (!player || player.id !== id || player.status !== "playing") throw new Error("No es tu turno");
        player.hit(this.deck.drawOne());
        this.advance();
    }
    stand(id: string) {
        const player = this.current();
        if (!player || player.id !== id || player.status !== "playing") throw new Error("No es tu turno");
        player.stand();
        this.advance();
    }
    current() { return this.players[this.turn]; }
    private advance() {
        const next = this.players.findIndex((player) => player.status === "playing");
        if (next >= 0) {
            this.turn = next;
            return;
        }
        this.dealerTurn();
    }
    private dealerTurn() {
        this.phase = "dealer";
        this.message = "Turno del dealer";
        while (this.dealer.score < 17) this.dealer.receive([this.deck.drawOne()]);
        this.settle();
    }
    private settle() {
        for (const player of this.players) {
            const dealer = this.dealer.score;
            if (player.status === "busted") {
                player.result = "lose";
            } else if (player.status === "blackjack" && dealer !== 21) {
                player.result = "blackjack";
                player.win(Math.floor(player.bet * 2.5));
            } else if (dealer > 21 || player.score > dealer) {
                player.result = "win";
                player.win(player.bet * 2);
            } else if (player.score === dealer) {
                player.result = "push";
                player.win(player.bet);
            } else {
                player.result = "lose";
            }
        }
        this.phase = "done";
        this.message = "Ronda terminada";
    }
    toJSON(_viewer?: string, room = ""): BlackjackRoomState {
        const showHole = this.phase === "done" || this.phase === "dealer";
        return {
            room,
            phase: this.phase,
            message: this.message,
            turn: this.phase === "playing" ? this.current()?.id ?? null : null,
            dealer: this.dealer.toJSON(showHole).hand,
            dealerScore: showHole ? this.dealer.score : handScore(this.dealer.hand.slice(0, 1)),
            players: this.players.map((player) => player.toJSON()),
        };
    }
}
