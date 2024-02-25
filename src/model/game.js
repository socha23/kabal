import Deck from "./deck"
import { starterCards } from "./cards"

class Game {
    constructor(handSize = 5) {

        this.handSize = handSize
        this.hand = []
        this.cards = {}
        this.slots = {
            "a1": { id: "a1", name: "area 1"},
            "a2": { id: "a2", name: "area 2"},
            "a3": { id: "a3", name: "area 3"},
            "a4": { id: "a4", name: "area 4"},
        }
        this.slottedCards = {} // slot id to card id

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
        const model = {
            slots: Object.values(this.slots)
                .map(s => ({ ...s, cardId: this.slottedCards[s.id]})),
            hand: this.hand,
            cards: Object.values(this.cards).filter(c => this.hand.includes(c.id) || Object.values(this.slottedCards).includes(c.id)),
            drawDeckSize: this.drawDeck.size(),
        }
        return model
    }

    findSlotIdByCardId(cardId) {
        return Object.keys(this.slots).find(sId => (this.slottedCards[sId] === cardId))
    }

    getSlotIdsWhereDropPossible(cardId) {
        return Object.keys(this.slots)
            .filter(sId => !(this.slottedCards[sId]))
    }


    removeCardFromItsLocation(cardId) {
        if (this.findSlotIdByCardId(cardId)) {
            this.slottedCards[this.findSlotIdByCardId(cardId)] = null
        } else if (this.hand.includes(cardId)) {
            this.hand.splice(this.hand.indexOf(cardId), 1)
        } else {
            throw `Can't find current location of card ${cardId}`
        }
    }

    onDropCardOnSlot(cardId, slotId) {
        if (this.slottedCards[slotId]) {
            return // slot busy
        }

        this.removeCardFromItsLocation(cardId)
        if (this.slottedCards[slotId]) {
            throw `Slot ${slotId} already busy!`
        }
        this.slottedCards[slotId] = cardId
    }

    onDropCardOnHand(cardId) {
        this.removeCardFromItsLocation(cardId)
        this.hand.push(cardId)
    }

    onDrawDeckClick() {
        this.drawCard()
    }
}

export default Game