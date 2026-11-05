export type Suit = "spades" | "hearts" | "clubs" | "diamonds";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export interface CardData {
    id: string;
    rank: Rank | "?";
    suit: Suit;
    value: number;
    hidden?: boolean;
    faceUp?: boolean;
}
export interface PlayerData {
    id: string;
    name: string;
    chips: number;
    bet: number;
    folded: boolean;
    hand: CardData[];
}
export interface CardRoomState {
    room: string;
    phase: string;
    players: PlayerData[];
}
export interface PokerPlayerData extends PlayerData {
    lastAction: string;
    acted: boolean;
}
export interface PokerRoomState extends CardRoomState {
    players: PokerPlayerData[];
    pot: number;
    currentBet: number;
    turn: string | null;
    dealer: string | null;
    community: CardData[];
    winners: string[];
}
export interface BlackjackPlayerData extends PlayerData {
    status: "playing" | "stood" | "busted" | "blackjack";
    score: number;
    result?: "win" | "lose" | "push" | "blackjack";
}
export interface BlackjackRoomState extends CardRoomState {
    players: BlackjackPlayerData[];
    dealer: CardData[];
    dealerScore: number;
    turn: string | null;
    message: string;
}
export interface SolitaireRoomState extends CardRoomState {
    tableau: CardData[][];
    foundations: CardData[][];
    stock: number;
    waste: CardData[];
    score: number;
    moves: number;
    won: boolean;
}
