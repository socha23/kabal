import { point } from "./geometry"
import RiderWaite from "../rider_waite/rider_waite"
import Deck from "./deck"
import { starterCards } from "./cards"

class Game {
    constructor(handSize = 5) {
      
      this.handSize = handSize

      this.hand = []
      
      this.cards = {}
  
      this.slots = {
        "a1": {id: "a1", name: "area 1", position: point(50, 50)},
        "a2": {id: "a2", name: "area 2", position: point(250, 50)},
        "a3": {id: "a3", name: "area 3", position: point(450, 50)},
        "a4": {id: "a4", name: "area 4", position: point(650, 50)},
      }
  
      this.slottedCards = {"a1": "c1"} // slot id to card id
    
      this.drawDeck = new Deck()
      this.discardDeck = new Deck()

      this.initializeDrawDeck()
    }


    initializeDrawDeck() {
        starterCards().forEach(c => {
            this.registerCard(c)
            this.drawDeck.addCard(c.id)
        })
        this.drawDeck.shuffle()
    }

    registerCard(card) {
        this.cards[card.id] = card
    }

    drawCard() {
        if (this.drawDeck.isEmpty()) {
            throw "Cannot draw from an empty deck"
        }
        this.hand.push(this.drawDeck.drawCard())
    }
  
    getViewModel() {
      return {
        slots: Object.values(this.slots)
          .map(s =>  this.slottedCards[s.id] ? {...s, card: this.cards[this.slottedCards[s.id]]} : s),
        hand: this.hand
          .map(cardId => this.cards[cardId]),
        drawDeckSize: this.drawDeck.size(),
      }
    }
  
    findSlotIdByCardId(cardId) {
        return Object.keys(this.slots).find(sId => (this.slottedCards[sId] === cardId))
      }
    
    getValidDropTargetIds(cardId) {
      return Object.keys(this.slots)
        .filter(sId => !(this.slottedCards[sId]))
    }
  
    onDropCardOnSlot(cardId, slotId) {
      if (this.findSlotIdByCardId(cardId)) {
        this.slottedCards[this.findSlotIdByCardId(cardId)] = null
        this.slottedCards[slotId] = cardId
      } else if (this.hand.includes(cardId)) {
        this.hand.splice(this.hand.indexOf(cardId), 1)
        this.slottedCards[slotId] = cardId
      }
    }

    onDrawDeckClick() {
        this.drawCard()
    }
  }
  

export default Game