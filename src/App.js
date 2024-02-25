import { useState, useRef, useLayoutEffect, useContext, createContext } from "react"
import Game from "./model/game"
import useAnimationFrame from "./useAnimationFrame"
import { POINT_ZERO, point, Rect, rect } from "./model/geometry"

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
  name = "Unnamed card",
  image = "",
  width = CARD_WIDTH,
  height = CARD_HEIGHT,
  position = null,
  onMouseDown = (e => { })
}) => {
  const positionStyle = position ? { position: "absolute", left: position.x, top: position.y } : {}
  return <div style={{
    zIndex: 1,
    width: width,
    height: height,
    border: "1px solid black",
    padding: 10,
    backgroundColor: "#bbb",
    display: "flex",
    flexDirection: "column",
    ...positionStyle
  }}
    onMouseDown={onMouseDown}
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
}

const AURA_STYLE = {
  borderWidth: 5,
  padding: 5,
  borderRadius: 10,
  colors: {
    "dropPossible": "green"
  }
}

const Aura = ({
  rect, type,
}) => <div
    style={{
      position: "absolute",
      width: rect.w + 2 * (AURA_STYLE.borderWidth + AURA_STYLE.padding),
      height: rect.h + 2 * (AURA_STYLE.borderWidth + AURA_STYLE.padding),
      top: rect.y - (AURA_STYLE.borderWidth + AURA_STYLE.padding),
      left: rect.x - (AURA_STYLE.borderWidth + AURA_STYLE.padding),
      borderRadius: AURA_STYLE.borderRadius,
      padding: AURA_STYLE.padding,
      borderStyle: "solid",
      borderWidth: AURA_STYLE.borderWidth,
      borderColor: AURA_STYLE.colors[type] || "transparent",
    }} />

const SLOT_STYLE = {
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  innerBorder: "1px solid #888",
}

/* actual screen coordinates of slots, filled after layout, indexed by slotId */
const slotRects = {
}

const SlotContext = createContext({
  slotsById: {},
  slotIdsWhereDropPossible: [],
})

const Slot = ({id}) => {
  const slotContext = useContext(SlotContext)
  const slotDef = slotContext.slotsById[id]
  if (!slotDef) {
    throw `Slot definition for slot ${id} not found`
  }
  const dropPossible = slotContext.slotIdsWhereDropPossible.includes(id)
  const ref = useRef(null)
  useLayoutEffect(() => {
    if (ref.current) {
      const domRect = ref.current.getBoundingClientRect();
      slotRects[id] = rect(domRect.left, domRect.top, domRect.width, domRect.height)
    }
  })
  return <div> {/* main container */}
    {slotRects[id] && <Aura
      rect={slotRects[id]}
      type={dropPossible ? "dropPossible" : "none"}
    />}
    <div
      ref={ref}
      style={{
        border: SLOT_STYLE.innerBorder,
        width: SLOT_STYLE.width,
        height: SLOT_STYLE.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <div>{slotDef.name}</div>
    </div>
  </div>
}

var handRect = rect(0, 200, 600, 200) // will be overridden by layout

const Hand = ({
  dropPossible = false,
  onMouseOver = e => { },
  onMouseOut = e => { },
}) => {
  const ref = useRef(null)
  useLayoutEffect(() => {
    if (ref.current) {
      const domRect = ref.current.getBoundingClientRect();
      handRect = rect(domRect.left, domRect.top, domRect.width, domRect.height)
    }
  })
  return <div ref={ref} style={{
    width: "100%",
    height: CARD_HEIGHT
  }}>
    <Aura
      rect={handRect}
      type={dropPossible ? "dropPossible" : "none"}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    />
  </div>
}

const ARENA_STYLE = {
  gap: 30
}

const MainArena = ({
  slotsById = {},
  slotIdsWhereDropPossible = []
}) => <SlotContext.Provider value={{slotsById: slotsById, slotIdsWhereDropPossible: slotIdsWhereDropPossible}}>
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: ARENA_STYLE.gap,
      padding: 20,
    }}>
      <Slot id="a1"/>
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: ARENA_STYLE.gap,
      }}>
        <Slot id="a2"/>
        <Slot id="a3"/>
      </div>
      <Slot id="a4"/>
    </div>
  </SlotContext.Provider>


const Toolkit = ({
  onDrawDeckClick = () => { },
  drawDeckSize = 0
}) => <div style={{display: "flex", flexDirection: "column", width: 100}}>
    <div style={{
      border: "1px solid #ddd",
      padding: 15,
      cursor: "pointer",
    }}
      onClick={e => { onDrawDeckClick() }}
    >DRAW CARD ({drawDeckSize})</div>
  </div>

function GameDisplay({
  slotsById = {},
  cards = [],
  drawDeckSize = 0,
  onDrawDeckClick = () => { },
  handDropPossible = false,
  slotIdsWhereDropPossible = [],
  cardPositions = {},
  onMouseDownOnCard = ((e, cardId) => { }),
  onMouseMove = (e) => { },
  onMouseUp = (e) => { },
}) {
  return <div
    onMouseUp={onMouseUp}
    onMouseMove={onMouseMove}
    style={{
      position: "relative",
    }}>
    {
      cards.map(c => <Card {...c}
        key={c.id}
        position={cardPositions[c.id]}
        onMouseDown={e => { onMouseDownOnCard(e, c.id) }}
      />)
    }
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}>
      <MainArena slotsById={slotsById} slotIdsWhereDropPossible={slotIdsWhereDropPossible} />
      <div style={{display: "flex"}}>
        <Toolkit onDrawDeckClick={onDrawDeckClick} drawDeckSize={drawDeckSize} />
        <Hand dropPossible={handDropPossible} />
      </div>
    </div>
  </div>
}



function GameContainer({ game }) {
  const [gameViewModel, setGameViewModel] = useState(game.getViewModel())
  const [currentDraggedId, setCurrentDraggedId] = useState()
  const [currentDraggedPosition, setCurrentDraggedPosition] = useState(POINT_ZERO)
  const [currentDraggedOffset, setCurrentDraggedOffset] = useState(POINT_ZERO)
  const [mouseOverSlotId, setMouseOverSlotId] = useState(null)
  const [mouseOverHand, setMouseOverHand] = useState(null)

  useAnimationFrame(deltaMs => {
    // TODO world update 
    // TODO animations update
    setGameViewModel(game.getViewModel())
  })

  const cardPositions = {}
  gameViewModel.hand.forEach((cardId, idx) => cardPositions[cardId] = point(handRect.x + idx * CARD_WIDTH + 20, handRect.y))
  gameViewModel.slots.forEach(slot => { if (slot.cardId) { cardPositions[slot.cardId] = slotRects[slot.id].topLeft() } })
  if (currentDraggedId) {
    cardPositions[currentDraggedId] = currentDraggedPosition
  }

  const slotsById = {}
  gameViewModel.slots.forEach(s => {slotsById[s.id] = s})

  return <GameDisplay
    {...gameViewModel}
    slotsById={slotsById}
    slotIdsWhereDropPossible={currentDraggedId ? game.getSlotIdsWhereDropPossible(currentDraggedId) : []}
    handDropPossible={currentDraggedId != null && !gameViewModel.hand.includes(currentDraggedId)}
    onDrawDeckClick={_ => { game.onDrawDeckClick() }}
    cardPositions={cardPositions}
    onMouseDownOnCard={(e, cardId) => {
      setCurrentDraggedId(cardId)
      const cardBox = e.currentTarget.getBoundingClientRect()
      const offset = point(e.clientX - cardBox.left, e.clientY - cardBox.top)
      setCurrentDraggedOffset(offset)
      setCurrentDraggedPosition(point(e.clientX - offset.x, e.clientY - offset.y))
      e.preventDefault()
    }}
    onMouseMove={e => {
      if (!currentDraggedId) {
        return
      }
      const cardPosition = point(e.clientX - currentDraggedOffset.x, e.clientY - currentDraggedOffset.y)
      setCurrentDraggedPosition(point(e.clientX - currentDraggedOffset.x, e.clientY - currentDraggedOffset.y))
      const cardRect = new Rect(cardPosition.x, cardPosition.y, CARD_WIDTH, CARD_HEIGHT)

      var overSlot = null

      Object.keys(slotRects).forEach(sId => {
        if (slotRects[sId].intersects(cardRect)) {
          overSlot = sId
        }
      })
      setMouseOverSlotId(overSlot)
      setMouseOverHand(cardRect.intersects(handRect))
    }}
    onMouseUp={e => {
      if (!currentDraggedId) {
        return
      } else if (mouseOverSlotId) {
        game.onDropCardOnSlot(currentDraggedId, mouseOverSlotId)
      } else if (mouseOverHand) {
        game.onDropCardOnHand(currentDraggedId)
      }
      setCurrentDraggedId(null)
      setGameViewModel(game.getViewModel())
    }}
  />
}

const GAME = new Game()

const App = () => <GameContainer game={GAME} />

export default App;
