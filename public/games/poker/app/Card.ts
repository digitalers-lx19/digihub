export interface Card {
    number: number;
    icon: string;
    color: string;
}
export class Card implements Card{
    constructor({number, icon, color}:Card) {
        this.number = number;
        this.icon = icon;
        this.color = color;
    }
    getValue(){
        return this.number < 1 || this.number > 9 ? 10 : this.number
    }
    getSymbol(){
        return this.number < 1 || this.number > 9 ? ["A", "J", "Q", "K"][this.number - 1] : this.number
    }
}
export class BlackJack extends Card {
    constructor(props){
        super(props);
    }
} 
