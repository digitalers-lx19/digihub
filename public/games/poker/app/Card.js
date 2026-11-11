export class Card {
    constructor({ number, icon, color }) {
        this.number = number;
        this.icon = icon;
        this.color = color;
    }
    getValue() {
        return this.number < 1 || this.number > 9 ? 10 : this.number;
    }
}
export class BlackJack extends Card {
    constructor(props) {
        super(props);
    }
}
