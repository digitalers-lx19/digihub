const socket = io();
const roomInput = document.getElementById("roomInput");
const createBtn = document.getElementById("createBtn");
const joinBtn = document.getElementById("joinBtn");
const info = document.getElementById("info");
const lobby = document.querySelector(".lobby");
const game = document.querySelector(".game");
const boardEl = document.getElementById("board");
const roomLabel = document.getElementById("roomLabel");
const roleLabel = document.getElementById("roleLabel");
const turnLabel = document.getElementById("turnLabel");
const resultEl = document.getElementById("result");
const restartBtn = document.getElementById("restartBtn");

let currentRoom = null;
let currentRole = null;
let currentSymbol = null;
let myTurn = false;

for (let i = 0; i < 9; i++) {
    const cell = document.createElement("button");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", () => onCellClick(i));
    boardEl.appendChild(cell);
}

createBtn.addEventListener("click", () => {
    const room = roomInput.value.trim();
    if (!room) return;
    socket.emit("tictactoe:create", { room });
});

joinBtn.addEventListener("click", () => {
    const room = roomInput.value.trim();
    if (!room) return;
    socket.emit("tictactoe:join", { room });
});

restartBtn.addEventListener("click", () => {
    if (!currentRoom) return;
    socket.emit("tictactoe:restart", { room: currentRoom });
});

function onCellClick(index) {
    if (!currentRoom || currentRole !== "player" || !myTurn) return;
    socket.emit("tictactoe:move", { room: currentRoom, index });
}

socket.on("tictactoe:created", (data) => {
    info.textContent = `Sala creada: ${data.room}. Ahora únete desde otro cliente.`;
});

socket.on("tictactoe:joined", (data) => {
    currentRoom = data.room;
    currentRole = data.role;
    currentSymbol = data.symbol || null;
    lobby.classList.add("hidden");
    game.classList.remove("hidden");
    roomLabel.textContent = data.room;
    roleLabel.textContent = data.role === "player" ? `Jugador ${data.symbol}` : "Observador";
    restartBtn.classList.add("hidden");
    resultEl.textContent = "";
});

socket.on("tictactoe:room:update", (state) => {
    renderBoard(state);
    turnLabel.textContent = state.turn;
    if (state.winner) {
        resultEl.textContent = `Ganador: ${state.winner}`;
        myTurn = false;
        if (currentRole === "player" && state.players.length === 2) {
            restartBtn.classList.remove("hidden");
        }
        return;
    }
    if (state.draw) {
        resultEl.textContent = "Empate";
        myTurn = false;
        if (currentRole === "player" && state.players.length === 2) {
            restartBtn.classList.remove("hidden");
        }
        return;
    }
    myTurn = currentRole === "player" && currentSymbol === state.turn;
    resultEl.textContent = myTurn ? "Es tu turno" : "Esperando turno";
    restartBtn.classList.add("hidden");
});

function renderBoard(state) {
    const cells = boardEl.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
        const value = state.board[index];
        cell.textContent = value || "";
        cell.classList.toggle("disabled", value !== null || currentRole !== "player" || !myTurn);
    });
}
