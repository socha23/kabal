import { point } from "./geometry"
import RiderWaite from "../rider_waite/rider_waite"

class Game {
    constructor(handSize = 5) {
      
      this.hand = ["c0"]
      
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
    }
  
    findSlotIdByCardId(cardId) {
      return Object.keys(this.slots).find(sId => (this.slottedCards[sId] === cardId))
    }
  
    getViewModel() {
      return {
        slots: Object.values(this.slots)
          .map(s =>  this.slottedCards[s.id] ? {...s, card: this.cards[this.slottedCards[s.id]]} : s),
        hand: this.hand
          .map(cardId => this.cards[cardId]),
      }
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
  }
  

export default Game