import { cardElement } from "/cards/ui.js";
const socket = io();
const $ = (id) => document.getElementById(id);
const state = { room: null, data: null, selection: null };
const setError = (message) => { $("error").textContent = message; };
const pile = (type, index, cards, className) => {
    const node = document.createElement("div");
    node.className = className;
    node.dataset.pileType = type;
    if (index !== undefined) node.dataset.pileIndex = String(index);
    for (const card of cards) node.append(cardElement(card));
    return node;
};
const selected = (node) => {
    if (!state.selection) return;
    const card = node.querySelector(`[data-card-id="${state.selection.cardId}"]`);
    if (card) card.classList.add("card--selected");
};
const render = () => {
    const data = state.data;
    if (!data) return;
    $("roomLabel").textContent = data.room;
    $("scoreLabel").textContent = data.score;
    $("movesLabel").textContent = data.moves;
    $("phaseLabel").textContent = data.won ? "Ganaste" : data.phase;
    $("stockLabel").textContent = data.stock;
    $("drawBtn").disabled = !state.room;
    const waste = $("waste");
    waste.replaceChildren(...data.waste.map(cardElement));
    selected(waste);
    $("foundations").replaceChildren(...data.foundations.map((cards, index) => {
        const node = pile("foundation", index, cards, "foundation stack");
        selected(node);
        return node;
    }));
    $("tableau").replaceChildren(...data.tableau.map((cards, index) => {
        const node = pile("tableau", index, cards, "pile stack");
        selected(node);
        return node;
    }));
};
const start = () => {
    const room = $("roomInput").value.trim();
    if (!room) return setError("Escribe un código de sala");
    state.room = room;
    socket.emit("solitaire:start", { room, name: $("nameInput").value.trim() || "Jugador" });
};
const move = (to) => {
    const from = state.selection.from;
    socket.emit("solitaire:move", { room: state.room, from, to, cardId: state.selection.cardId });
    state.selection = null;
};
const samePile = (a, b) => a.type === b.type && (a.index ?? 0) === (b.index ?? 0);
document.addEventListener("click", (event) => {
    if (!state.data) return;
    if (event.target.closest("#stock")) {
        return socket.emit("solitaire:draw", { room: state.room });
    }
    const node = event.target.closest("[data-pile-type]");
    if (!node) return;
    const target = { type: node.dataset.pileType, index: Number(node.dataset.pileIndex) };
    const card = event.target.closest(".card");
    if (card && !card.classList.contains("card--hidden")) {
        if (state.selection && !samePile(state.selection.from, target)) return move(target);
        state.selection = { from: target, cardId: card.dataset.cardId };
        return render();
    }
    if (state.selection) move(target);
});
$("startBtn").addEventListener("click", start);
$("drawBtn").addEventListener("click", () => socket.emit("solitaire:draw", { room: state.room }));
socket.on("solitaire:update", (data) => { state.data = data; setError(""); render(); });
socket.on("solitaire:joined", ({ room }) => { state.room = room; $("drawBtn").disabled = false; });
socket.on("solitaire:error", ({ message }) => setError(message));
