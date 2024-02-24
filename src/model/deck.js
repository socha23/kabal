// fisher-yates
const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

class Deck {
    constructor(cards = []) {
      this.cards = cards  
    }
  
    drawCard() {
      if (this.isEmpty()) {
        throw "Deck empty"
      }
      return this.cards.shift()
    }

    isEmpty() {
      return this.cards.length === 0
    }

    size() {
      return this.cards.length
    }

    addCard(card) {
      this.cards.unshift(card)
    }

    shuffle() {
      shuffleArray(this.cards)
    }

  }
  

export default Deck