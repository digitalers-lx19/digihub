export class Player {
    hand = [];
    score = 0;
    money = 1000;
    draw() {
        // Pedir
    }
    bet(ammount = 100) {
        // Apostar
        if (ammount <= this.money)
            this.money -= ammount;
        return `el monto a apostar debe ser menor a ${this.money}`;
    }
    fold() {
        // Retirada
    }
}
