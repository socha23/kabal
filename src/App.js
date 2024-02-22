import { useState, useRef, useEffect } from "react"
import RiderWaite from "./rider_waite"

function point(x, y) {
  return { x: x, y: y }
}

const POINT_ZERO = point(0, 0)

class Game {
  constructor() {
    this.cards = {
      "c0": {id: "c0", name: "Fool", image: RiderWaite.C0_Fool},
      "c1": {id: "c1", name: "Magician", image: RiderWaite.C1_Magician},
    }

    this.slots = {
      "a1": {id: "a1", name: "area 1", position: point(50, 50), card: "c0"},
      "a2": {id: "a2", name: "area 2", position: point(250, 50), card: "c1"},
      "a3": {id: "a3", name: "area 3", position: point(450, 50)},
      "a4": {id: "a4", name: "area 4", position: point(650, 50)},
    }
  }

  findSlotByCardId(cardId) {
    const slot = Object.values(this.slots).find(params => params.card === cardId)
    if (!slot) {
      throw `Slot not found for card ${cardId}`
    }
    return slot
  }

  getViewModel() {
    return {
      cards: Object.values(this.cards)
      .map(c => ({
          position: this.findSlotByCardId(c.id).position, 
          ...c
      })),
      slots: Object.values(this.slots),
    }
  }

  getValidDropTargetIds(cardId) {
    return Object.values(this.slots)
      .filter(s => ! ("card" in s))
      .map(s => s.id)
  }

  onMoveCardToSlot(cardId, slotId) {
    delete this.slots[this.findSlotByCardId(cardId).id].card
    this.slots[slotId].card = cardId
  }
}

const CARD_STYLE = {
  imageHeight: 200,
  imageWidth: 120,
  imageBorderWidth: 1,
  titleBarHeight: 20,
  padding: 10,
}

const CARD_HEIGHT = CARD_STYLE.titleBarHeight + CARD_STYLE.imageHeight + 2 * CARD_STYLE.padding
const CARD_WIDTH = CARD_STYLE.imageWidth + 2 * CARD_STYLE.padding

const Card = ({
  id,
  position = POINT_ZERO,
  draggable = true,
  name = "Unnamed card",
  image = "",
  width = CARD_WIDTH,
  height = CARD_HEIGHT,
  onDragStart = e => {},
  onDragEnd = e => {},
}) => <div style={{
  position: "absolute",
  width: width,
  height: height,
  top: position.y,
  left: position.x,
  border: "1px solid black",
  padding: 10,
  backgroundColor: "#bbb",
  display: "flex",
  flexDirection: "column",
}}
  draggable={draggable}
  onDragStart={onDragStart}
  onDragEnd={onDragEnd}
>
    <div style={{
      color: "black",
      height: CARD_STYLE.titleBarHeight
    }}>{name}</div>
    <div style={{
      border: "1px solid black",
      backgroundImage: `url("${image}")`,
      height: CARD_STYLE.imageHeight,
      width: CARD_STYLE.imageWidth,
    }}>
    </div>
    
  </div>


const SLOT_STYLE = {
  slotBorderWidth: 5, 
  slotPadding: 10,
  slotBorderRadius: 10,
  slotDroppableBorderColor: "green",
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  innerBorder: "1px solid #888",
}

const Slot = ({
  id,
  dropPossible = false,
  position = POINT_ZERO,
  name = "Unnamed slot",
  width = SLOT_STYLE.width,
  height = SLOT_STYLE.height,
  onCardDrop = (slotId) => {}
}) => <div
  onDragOver={e => { e.preventDefault(); return false }}
  onDrop={e => {onCardDrop(id)}}
  style={{
    position: "absolute",
    width: width + 2 * (SLOT_STYLE.slotBorderWidth + SLOT_STYLE.slotPadding),
    height: height + 2 * (SLOT_STYLE.slotBorderWidth + SLOT_STYLE.slotPadding),
    top: position.y - (SLOT_STYLE.slotBorderWidth + SLOT_STYLE.slotPadding),
    left: position.x - (SLOT_STYLE.slotBorderWidth + SLOT_STYLE.slotPadding),
    padding: SLOT_STYLE.slotPadding,
    borderWidth: SLOT_STYLE.slotBorderWidth,
    borderStyle: "solid",    
    borderColor: dropPossible ? SLOT_STYLE.slotDroppableBorderColor : "transparent",
    borderRadius: SLOT_STYLE.slotBorderRadius,
  }}>
    <div style={{
      border: SLOT_STYLE.innerBorder,
      width: SLOT_STYLE.width,
      height: SLOT_STYLE.height,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div>{name}</div>
    </div>
  </div>

const DEFAULT_BOARD_WITDH = 800
const DEFAULT_BOARD_HEIGHT = 600

function BoardDisplay({
  slots = [],
  cards = [],
  height = DEFAULT_BOARD_HEIGHT,
  width = DEFAULT_BOARD_WITDH,
  onCardDragStart = (cardId) => {},
  onCardDragEnd = (cardId) => {},
  onCardDrop = (slotId) => {},
  availableDropTargetIds = []

}) {
  return <div
    style={{
      width: width,
      height: height,
      position: "relative",
      border: "1px solid black"
    }}>
    {
      slots.map(a => <Slot key={a.id} 
        dropPossible={availableDropTargetIds.includes(a.id)} 
        onCardDrop={onCardDrop}
        {...a} 
      />)
    }
    {
      cards.map(c => <Card key={c.id} 
        onDragStart={_ => {onCardDragStart(c.id)}} 
        onDragEnd={_ => {onCardDragEnd(c.id)}}         
        {...c}        
      />)
    }
  </div>
}


// from https://codesandbox.io/s/requestanimationframe-with-hooks-0kzh3?from-embed
const useAnimationFrame = (callback) => {
  const requestRef = useRef()
  const previousTimeRef = useRef()
  useEffect(() => {
      const animate = time => {
          if (previousTimeRef.current !== undefined) {
              const deltaMs = time - previousTimeRef.current
              callback(deltaMs)
          }
          previousTimeRef.current = time
          requestRef.current = requestAnimationFrame(animate)
      }
      requestRef.current = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(requestRef.current)
  }, [])
}

function GameContainer({game}) {
  const [gameViewModel, setGameViewModel] = useState(game.getViewModel())
  const [currentDraggedId, setCurrentDraggedId] = useState()

  useAnimationFrame(deltaMs => {
    // TODO world update 
    // TODO animations update
    setGameViewModel(game.getViewModel())
  })

  return <BoardDisplay
    slots={gameViewModel.slots}
    cards={gameViewModel.cards}
    availableDropTargetIds={currentDraggedId ? game.getValidDropTargetIds(currentDraggedId) : []}
    onCardDragStart={id => {setCurrentDraggedId(id)}}
    onCardDragEnd={_ => {setCurrentDraggedId(null)}}
    onCardDrop={(slotId) => game.onMoveCardToSlot(currentDraggedId, slotId)}
  />
}

const GAME = new Game()

const App = () => <GameContainer game={GAME}/>

export default App;
