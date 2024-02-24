import { point } from "./geometry"
import RiderWaite from "../rider_waite/rider_waite"
import Deck from "./deck"

var autoinc = 0

const MAJOR_ARCANA = {
  fool: {name: "Fool", image: RiderWaite.C0_Fool},
  magician: {name: "Magician", image: RiderWaite.C1_Magician},
  priestess: {name: "Priestess", image: RiderWaite.C2_Priestess},
  empress: {name: "Empress", image: RiderWaite.C3_Empress},
  emperor: {name: "Emperor", image: RiderWaite.C4_Emperor},
}

function card(deck, type) {
  return createCard(type, deck[type])
}

function createCard(type, template) {
  return {id: "card_" + type + "_" + autoinc++, type: type, ...template}
}

export function starterCards() {
  return [
    card(MAJOR_ARCANA, "fool"),
    card(MAJOR_ARCANA, "fool"),
    card(MAJOR_ARCANA, "magician"),
    card(MAJOR_ARCANA, "magician"),
    card(MAJOR_ARCANA, "priestess"),
    card(MAJOR_ARCANA, "priestess"),
    card(MAJOR_ARCANA, "empress"),
    card(MAJOR_ARCANA, "empress"),
    card(MAJOR_ARCANA, "emperor"),
    card(MAJOR_ARCANA, "emperor"),
  ]
}

class Game {
    constructor(handSize = 5) {
      
      this.handSize = handSize

      this.hand = []
      
      this.cards = {
        "c0": {id: "c0", name: "Fool", image: RiderWaite.C0_Fool},
        "c1": {id: "c1", name: "Magician", image: RiderWaite.C1_Magician},
      }
  
      this.slots = {
        "a1": {id: "a1", name: "area 1", position: point(50, 50)},
        "a2": {id: "a2", name: "area 2", position: point(250, 50)},
        "a3": {id: "a3", name: "area 3", position: point(450, 50)},
        "a4": {id: "a4", name: "area 4", position: point(650, 50)},
      }
  
      this.slottedCards = {"a1": "c1"} // slot id to card id
    
      this.drawDeck = new Deck(["c0", "c1"])
      this.discardDeck = new Deck()
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
  
    onMoveCardToSlot(cardId, slotId) {
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