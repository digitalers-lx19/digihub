export const SUITS = { spades: "♠", hearts: "♥", clubs: "♣", diamonds: "♦" };
const RED = new Set(["hearts", "diamonds"]);
const LABELS = { A: "A", J: "J", Q: "Q", K: "K" };
const rankLabel = (rank) => LABELS[rank] ?? rank;
export const cardElement = (card) => {
    const node = document.createElement("article");
    node.className = "card";
    if (card.hidden) {
        node.classList.add("card--hidden");
        return node;
    }
    if (RED.has(card.suit)) node.classList.add("card--red");
    node.dataset.cardId = card.id;
    const rank = document.createElement("span");
    rank.className = "card__rank";
    rank.textContent = rankLabel(card.rank);
    const suit = document.createElement("span");
    suit.className = "card__suit";
    suit.textContent = SUITS[card.suit] ?? "?";
    node.append(rank, suit);
    return node;
};
export const renderCards = (target, cards = []) => {
    target.replaceChildren(...cards.map(cardElement));
    return target;
};
export const renderPiles = (target, piles, className) => {
    target.replaceChildren(...piles.map((pile) => {
        const slot = document.createElement("div");
        slot.className = className;
        renderCards(slot, pile);
        return slot;
    }));
    return target;
};
export const label = (node, value) => {
    node.textContent = value ?? "";
    return node;
};
