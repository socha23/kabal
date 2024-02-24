import { useState } from "react"
import Game from "./model/game"
import useAnimationFrame from "./useAnimationFrame"
import { POINT_ZERO, point, Rect } from "./model/geometry"

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
  position,
  dropPossible = false,
  name = "Unnamed slot",
  card = null,
  width = SLOT_STYLE.width,
  height = SLOT_STYLE.height,
  onMouseDownOnCard = ((e, cardId) => { }),
  onMouseOver = e => { },
  onMouseOut = e => { },
  cardPositions = {},
}) =>
  <div> {/* main container */}
    <div
      onMouseEnter={onMouseOver}
      onMouseLeave={onMouseOut}
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
      }} />
    {
      card && 
        <Card
          onMouseDown={e => { onMouseDownOnCard(e, card.id) }}
          position={cardPositions[card.id]}
          {...card}
        />
    }
      <div style={{
        border: SLOT_STYLE.innerBorder,
        width: SLOT_STYLE.width,
        height: SLOT_STYLE.height,
        position: "absolute",
        top: position.y,
        left: position.x,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div>{name}</div>
      </div>
  </div>


const DEFAULT_BOARD_WITDH = 800
const DEFAULT_BOARD_HEIGHT = 600


const Hand = ({
  cards,
  cardPositions,
  onMouseDownOnCard = ((e, cardId) => { }),
  onMouseOver = e => { },
  onMouseOut = e => { },
}) => <div>
    {/* hand drop overlay */}
    <div style={{
      position: "absolute",
      left: 80,
      top: 300,
      width: "100%",
      height: CARD_HEIGHT
    }}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    />
    {
      /* cards */
      cards.map(c => <Card
        onMouseDown={e => { onMouseDownOnCard(e, c.id) }}
        position={cardPositions[c.id]}
        {...c}
      />
      )
    }
  </div>


function BoardDisplay({
  slots = [],
  hand = [],
  drawDeckSize = 0,
  height = DEFAULT_BOARD_HEIGHT,
  width = DEFAULT_BOARD_WITDH,
  onDrawDeckClick = () => { },
  slotIdsWhereDropPossible = [],
  currentDraggedId = null,
  cardPositions = {},

  onMouseDownOnCard = ((e, cardId) => { }),
  onMouseMove = (e) => { },
  onMouseUp = (e) => { },
  onMouseOverHand = (e) => { },
  onMouseOutHand = (e) => { },
  onMouseOverSlot = (e, slotId) => { },
  onMouseOutSlot = (e, slotId) => { },

}) {
  return <div
    onMouseUp={onMouseUp}
    onMouseMove={onMouseMove}
    style={{
      width: width,
      height: height,
      position: "relative",
      border: "1px solid black"
    }}>
    {
      slots.map(a => <Slot key={a.id}
        dropPossible={slotIdsWhereDropPossible.includes(a.id)}
        onMouseDownOnCard={onMouseDownOnCard}
        onMouseOver={e => { onMouseOverSlot(e, a.id) }}
        onMouseOut={e => { onMouseOutSlot(e, a.id) }}
        cardPositions={cardPositions}
        {...a}
      />)
    }
    <Hand
      cards={hand}
      cardPositions={cardPositions}
      onMouseDownOnCard={onMouseDownOnCard}
      onMouseOver={onMouseOverHand}
      onMouseOut={onMouseOutHand}
    />

    <div style={{ position: "absolute", bottom: 0 }}>
      <div style={{
        border: "1px solid #ddd",
        padding: 15,
        cursor: "pointer"

      }}
        onClick={e => { onDrawDeckClick() }}
      >DRAW CARD ({drawDeckSize})</div>
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
  gameViewModel.hand.forEach((card, idx) => cardPositions[card.id] = point(idx * CARD_WIDTH + 20, 400))
  gameViewModel.slots.forEach(slot => { if (slot.card) { cardPositions[slot.card.id] = slot.position } })

  if (currentDraggedId) {
    cardPositions[currentDraggedId] = currentDraggedPosition
  }
  return <BoardDisplay
    {...gameViewModel}
    slotIdsWhereDropPossible={currentDraggedId ? game.getSlotIdsWhereDropPossible(currentDraggedId) : []}
    onCardDragStart={id => { console.log("DRAGSTART"); setCurrentDraggedId(id) }}
    onCardDragEnd={_ => { setCurrentDraggedId(null) }}
    onDropCardOnSlot={(slotId) => { game.onDropCardOnSlot(currentDraggedId, slotId) }}
    onDropCardOnHand={() => { game.onDropCardOnHand(currentDraggedId) }}
    onDrawDeckClick={_ => { game.onDrawDeckClick() }}
    currentDraggedId={currentDraggedId}
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
      gameViewModel.slots.forEach(s => {
        const slotRect = new Rect(s.position.x, s.position.y, SLOT_STYLE.width, SLOT_STYLE.height)
        if (slotRect.intersects(cardRect)) {
          overSlot = s.id
        }
      })
      setMouseOverSlotId(overSlot)
    }}
    onMouseUp={e => {
      if (mouseOverSlotId) {
        game.onDropCardOnSlot(currentDraggedId, mouseOverSlotId)
      }
      setCurrentDraggedId(null)
    }}
  />
}

const GAME = new Game()

const App = () => <GameContainer game={GAME} />

export default App;
