import { renderCards } from "/cards/ui.js";
const socket = io();
const $ = (id) => document.getElementById(id);
const state = { room: null, id: null, data: null };
const actionButtons = [...document.querySelectorAll("[data-action]")];
const setError = (message) => { $("error").textContent = message; };
const join = () => {
    const room = $("roomInput").value.trim();
    if (!room) return setError("Escribe un código de sala");
    state.room = room;
    socket.emit("poker:join", { room, name: $("nameInput").value.trim() || "Jugador" });
};
const action = (name) => socket.emit("poker:action", {
    room: state.room,
    action: name,
    amount: Number($("raiseInput").value) || 0,
});
const playerCard = (player, mine) => {
    const box = document.createElement("div");
    box.className = "player";
    if (player.folded) box.classList.add("player--folded");
    if (state.data?.turn === player.id) box.classList.add("player--turn");
    const title = document.createElement("h3");
    title.textContent = `${player.name}${mine ? " (tú)" : ""}`;
    const info = document.createElement("p");
    info.textContent = `Fichas ${player.chips} · Apuesta ${player.bet} · ${player.lastAction}`;
    const hand = document.createElement("div");
    hand.className = "hand";
    renderCards(hand, player.hand);
    box.append(title, info, hand);
    return box;
};
const render = () => {
    const data = state.data;
    if (!data) return;
    $("roomLabel").textContent = data.room;
    $("phaseLabel").textContent = data.phase;
    $("potLabel").textContent = data.pot;
    $("betLabel").textContent = data.currentBet;
    const turn = data.players.find((player) => player.id === data.turn);
    $("turnLabel").textContent = turn?.name ?? "—";
    renderCards($("community"), data.community);
    $("players").replaceChildren(...data.players.map((player) => playerCard(player, player.id === state.id)));
    $("startBtn").disabled = state.id === null;
    const mine = data.turn === state.id && data.phase !== "showdown" && data.phase !== "waiting";
    for (const button of actionButtons) button.disabled = !mine;
};
$("joinBtn").addEventListener("click", join);
$("startBtn").addEventListener("click", () => socket.emit("poker:start", { room: state.room }));
for (const button of actionButtons) button.addEventListener("click", () => action(button.dataset.action));
socket.on("poker:joined", ({ id }) => { state.id = id; setError(""); $("startBtn").disabled = false; });
socket.on("poker:update", (data) => { state.data = data; render(); });
socket.on("poker:error", ({ message }) => setError(message));
socket.on("disconnect", () => { state.id = null; setError("Desconectado del servidor"); });
