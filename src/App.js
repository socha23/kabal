import { useState, useRef, useEffect } from "react"
import Game from "./model/game"


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
  draggable = true,
  name = "Unnamed card",
  image = "",
  width = CARD_WIDTH,
  height = CARD_HEIGHT,
  onDragStart = e => {},
  onDragEnd = e => {},
}) => <div style={{
  width: width,
  height: height,
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
  position,
  dropPossible = false,
  name = "Unnamed slot",
  card = null,
  width = SLOT_STYLE.width,
  height = SLOT_STYLE.height,
  onCardDragStart = (cardId) => {},
  onCardDragEnd = (cardId) => {},
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
    {
      card && <div style={{
        position: "absolute",
        zIndex: 1,
        top: 0,
        left: 0,
      }}>
        <Card onDragStart={_ => {onCardDragStart(card.id)}} onDragEnd={_ => {onCardDragEnd(card.id)}} {...card}/>
        </div>
    }
    <div style={{
      border: SLOT_STYLE.innerBorder,
      width: SLOT_STYLE.width,
      height: SLOT_STYLE.height,
      position: "absolute",
      top: 0,
      left: 0,
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
  hand = [],
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
        onCardDragStart={onCardDragStart}
        onCardDragEnd={onCardDragEnd}
        onCardDrop={onCardDrop}
        {...a} 
      />)
    }
    <div style={{
      position: "absolute",
      left: 80,
      top: 300
    }}>      
    {
      hand.map((c, idx) => <div key={c.id} style={{
        position: "absolute",
        top: 0,
        left: idx * CARD_WIDTH + 20
      }}>
        <Card
          onDragStart={_ => {onCardDragStart(c.id)}} 
          onDragEnd={_ => {onCardDragEnd(c.id)}}         
          {...c}        
        />        
      </div>)
    }
    </div>
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
    {...gameViewModel}
    availableDropTargetIds={currentDraggedId ? game.getValidDropTargetIds(currentDraggedId) : []}
    onCardDragStart={id => {setCurrentDraggedId(id)}}
    onCardDragEnd={_ => {setCurrentDraggedId(null)}}
    onCardDrop={(slotId) => {game.onMoveCardToSlot(currentDraggedId, slotId)}}
  />
}

const GAME = new Game()

const App = () => <GameContainer game={GAME}/>

export default App;
