import type { CardData, PokerPlayerData, PokerRoomState } from "../definitions/index.js";
import { buildDeck, Card, Deck, Player } from "./cards.js";

export class PokerCard extends Card {}

export class PokerDeck extends Deck<PokerCard> {
    constructor() { super(buildDeck((rank, suit) => new PokerCard(rank, suit))); }
}

export class PokerPlayer extends Player {
    lastAction = "wait";
    acted = false;
    toJSON(): PokerPlayerData {
        return { ...super.toJSON(), lastAction: this.lastAction, acted: this.acted };
    }
}

export type PokerPhase = "waiting" | "preflop" | "flop" | "turn" | "river" | "showdown";
export type PokerAction = "fold" | "check" | "call" | "raise";

const score5 = (cards: Card[]) => {
    const orders = cards.map((card) => card.order).sort((a, b) => b - a);
    const counts = new Map<number, number>();
    for (const order of orders) counts.set(order, (counts.get(order) ?? 0) + 1);
    const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
    const unique = [...counts.keys()].sort((a, b) => b - a);
    const flush = cards.every((card) => card.suit === cards[0].suit);
    const straight = unique.length === 5 && (unique[0] - unique[4] === 4 || (unique[0] === 14 && unique[1] === 5))
        ? (unique[0] === 14 && unique[1] === 5 ? 5 : unique[0]) : 0;
    const base = (category: number) => category * 10_000_000;
    const kicker = (values: number[]) => values.reduce((total, value, index) => total + value * 15 ** (4 - index), 0);
    if (flush && straight) return base(8) + straight;
    const quad = groups.find(([, count]) => count === 4);
    if (quad) return base(7) + kicker([quad[0], groups.find(([, count]) => count === 1)?.[0] ?? 0]);
    const trips = groups.find(([, count]) => count === 3);
    const pairs = groups.filter(([, count]) => count === 2);
    if (trips && pairs.length) return base(6) + kicker([trips[0], pairs[0][0]]);
    if (flush) return base(5) + kicker(orders);
    if (straight) return base(4) + straight;
    if (trips) return base(3) + kicker([trips[0], ...groups.filter(([, count]) => count === 1).map(([order]) => order)]);
    if (pairs.length >= 2) return base(2) + kicker([pairs[0][0], pairs[1][0], groups.find(([, count]) => count === 1)?.[0] ?? 0]);
    if (pairs.length === 1) return base(1) + kicker([pairs[0][0], ...groups.filter(([, count]) => count === 1).map(([order]) => order)]);
    return kicker(orders);
};

const combinations = (cards: Card[], size: number): Card[][] => {
    if (size === 0) return [[]];
    if (cards.length < size) return [];
    const [first, ...rest] = cards;
    return [...combinations(rest, size - 1).map((combo) => [first, ...combo]), ...combinations(rest, size)];
};

export const bestPokerScore = (cards: Card[]) => Math.max(...combinations(cards, 5).map(score5));
const hiddenCard = (): CardData => ({ id: "hidden", rank: "?", suit: "spades", value: 0, hidden: true });

export class PokerGame {
    players: PokerPlayer[] = [];
    deck = new PokerDeck();
    community: PokerCard[] = [];
    phase: PokerPhase = "waiting";
    pot = 0;
    currentBet = 0;
    turn = 0;
    dealer = 0;
    winners: string[] = [];

    addPlayer(id: string, name: string) {
        const existing = this.players.find((player) => player.id === id);
        if (existing) return existing;
        if (this.phase !== "waiting" || this.players.length >= 6) throw new Error("La partida no acepta más jugadores");
        const player = new PokerPlayer(id, name || "Jugador");
        this.players.push(player);
        return player;
    }

    removePlayer(id: string) {
        this.players = this.players.filter((player) => player.id !== id);
        if (this.phase !== "waiting") this.phase = "waiting";
        this.turn = Math.min(this.turn, Math.max(0, this.players.length - 1));
    }

    start() {
        if (this.players.length < 2) throw new Error("Se necesitan al menos 2 jugadores");
        this.deck = new PokerDeck().shuffle();
        this.community = [];
        this.pot = 0;
        this.currentBet = 0;
        this.winners = [];
        this.phase = "preflop";
        this.dealer = (this.dealer + 1) % this.players.length;
        this.turn = (this.dealer + 1) % this.players.length;
        for (const player of this.players) {
            player.discard();
            player.receive(this.deck.draw(2));
            player.lastAction = "wait";
            player.acted = false;
        }
    }

    act(id: string, action: PokerAction, amount = 0) {
        const player = this.players[this.turn];
        if (!player || player.id !== id || player.folded) throw new Error("No es tu turno");
        if (action === "fold") {
            player.folded = true;
            player.lastAction = "fold";
        } else if (action === "check") {
            if (player.bet !== this.currentBet) throw new Error("No puedes pasar");
            player.lastAction = "check";
        } else if (action === "call") {
            const paid = player.wager(this.currentBet - player.bet);
            this.pot += paid;
            player.lastAction = "call";
        } else if (action === "raise") {
            const paid = player.wager(amount);
            if (!paid) throw new Error("Apuesta inválida");
            this.pot += paid;
            this.currentBet = Math.max(this.currentBet, player.bet);
            for (const rival of this.players) if (rival !== player) rival.acted = false;
            player.lastAction = "raise";
        }
        player.acted = true;
        this.advance();
    }

    private advance() {
        const active = this.players.filter((player) => !player.folded);
        if (active.length <= 1) return this.finish(active);
        const roundOver = active.every((player) => player.acted && player.bet === this.currentBet);
        if (roundOver) return this.nextStreet();
        this.nextTurn();
    }

    private nextTurn() {
        do {
            this.turn = (this.turn + 1) % this.players.length;
        } while (this.players[this.turn].folded);
    }

    private nextStreet() {
        if (this.phase === "river") return this.showdown();
        for (const player of this.players) {
            player.bet = 0;
            player.acted = false;
        }
        this.currentBet = 0;
        if (this.phase === "preflop") {
            this.community = this.deck.draw(3);
            this.phase = "flop";
        } else if (this.phase === "flop") {
            this.community.push(...this.deck.draw(1));
            this.phase = "turn";
        } else if (this.phase === "turn") {
            this.community.push(...this.deck.draw(1));
            this.phase = "river";
        }
        this.turn = (this.dealer + 1) % this.players.length;
        while (this.players[this.turn].folded) this.turn = (this.turn + 1) % this.players.length;
    }

    private finish(winners: PokerPlayer[]) {
        const pot = this.pot;
        this.pot = 0;
        for (const player of winners) player.win(pot / winners.length);
        this.winners = winners.map((player) => player.id);
        this.phase = "showdown";
    }

    private showdown() {
        const active = this.players.filter((player) => !player.folded);
        let best = -1;
        const scores = active.map((player) => {
            const all = [...player.hand, ...this.community];
            const score = bestPokerScore(all);
            if (score > best) best = score;
            return { player, score };
        });
        const winners = scores.filter((entry) => entry.score === best).map((entry) => entry.player);
        this.finish(winners);
    }

    toJSON(viewer?: string, room = ""): PokerRoomState {
        const reveal = this.phase === "showdown";
        return {
            room,
            phase: this.phase,
            players: this.players.map((player) => ({
                ...player.toJSON(),
                hand: player.id === viewer || reveal ? player.toJSON().hand : player.hand.map(() => hiddenCard()),
            })) as PokerPlayerData[],
            pot: this.pot,
            currentBet: this.currentBet,
            turn: this.players[this.turn]?.id ?? null,
            dealer: this.players[this.dealer]?.id ?? null,
            community: this.community.map((card) => card.toJSON()),
            winners: this.winners,
        };
    }
}
