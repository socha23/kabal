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
