const flipButton = document.querySelector('#flip-button')
const optionContainer = document.querySelector('.option-container')
const gamesBoardContainer = document.querySelector('#gamesboard-container')
const startButton = document.querySelector('#start-button')
const infoDisplay = document.querySelector('#info')
const turnDisplay = document.querySelector('#turn-display')


// Option choosing
let angle = 0

function flip() {
const optionShips = Array.from(optionContainer.children)

angle = angle === 0 ? 90 : 0;

  optionShips.forEach(optionShip => optionShip.style.transform = `rotate(${angle}deg)`)
}

flipButton.addEventListener('click', flip)



// Creating Boards
const width = 10

function createBoard(color, user) {
  const gameBoardContainer = document.createElement('div')
  gameBoardContainer.classList.add('game-board')
  gameBoardContainer.style.backgroundColor = color
  gameBoardContainer.id = user

  for (let i = 0; i < width * width; i++) {
    const block = document.createElement('div')
    block.classList.add('block')
    block.id = i
    gameBoardContainer.append(block)
  }

  gamesBoardContainer.append(gameBoardContainer)
}

createBoard('yellow', 'player')
createBoard('pink', 'computer')

// Creating Ships

class Ship {
  constructor(name, length) {
    this.name = name
    this.length = length
  }
}

const destroyer = new Ship('destroyer', 2)
const submarine = new Ship('submarine', 3)
const cruiser = new Ship('cruiser', 3)
const battleship = new Ship('battleship', 4)
const carrier = new Ship('carrier', 5)

const ships = [destroyer, submarine, cruiser, battleship, carrier]
let notDropped

// Dragging Ships

function getValidity(allBoardBlocks, isHorizontal, startIndex, ship) {
  let validStart = isHorizontal ? startIndex <= width * width - ship.length ? startIndex : width * width - ship.length :
    startIndex <= width * width - width * ship.length ? startIndex : startIndex - ship.length * width + width


  let shipBlock = []

  for (let i = 0; i < ship.length; i++) {
    if (isHorizontal) {
      shipBlock.push(allBoardBlocks[Number(validStart) + i])
    } else {
      shipBlock.push(allBoardBlocks[Number(validStart) + width * i])
    }
  }

  let valid

  if (isHorizontal) {
    shipBlock.every((_block, index) =>
    valid = shipBlock[0].id % width !== width - (shipBlock.length - (index + 1)))
  } else {
    shipBlock.every((_block, index) =>
    valid = shipBlock[0].id < 90 + (width * index + 1))
  }

  const notTaken = shipBlock.every(block => !block.classList.contains('taken'))

  return { valid, notTaken, shipBlock }
}

function addShipPiece(user, ship, startId) {
  const allBoardBlocks = document.querySelectorAll(`#${user} div`)
  let randomBoolean = Math.random() < 0.5
  let isHorizontal = user === 'player' ? angle === 0 : randomBoolean
  let randomStartIndex = Math.floor(Math.random() * allBoardBlocks.length)

  let startIndex = startId ? startId : randomStartIndex

  const { valid, notTaken, shipBlock } = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

  if (valid && notTaken) {
    shipBlock.forEach(block => {
      block.classList.add(ship.name)
      block.classList.add('taken')
    })
  } else {
    if (user === 'computer') addShipPiece(user, ship, startId)
    if (user === 'player') notDropped = true
  }



}

ships.forEach(ship => addShipPiece('computer', ship))


// Dragging Player Ships

let draggedShip
const optionShips = Array.from(optionContainer.children)
optionShips.forEach(ship => ship.addEventListener('dragstart', dragStart))

const allPlayerBlocks = document.querySelectorAll('#player div')
allPlayerBlocks.forEach(block => {
  block.addEventListener('drop', dropShip)
  block.addEventListener('dragover', dragOver)})

function dragStart(e) {
  notDropped = false
  draggedShip = e.target
}

function dragOver(e) {
  e.preventDefault()
  const ship = ships[draggedShip.id]
  highlightArea(e.target.id, ship)
}

function dropShip(e) {
  const startId = e.target.id
  const ship = ships[draggedShip.id]
  addShipPiece('player', ship , startId)
  if (!notDropped) {
    draggedShip.remove()
  }
}

// Add highlight to ships

function highlightArea(startIndex, ship) {
  const allBoardBlocks = document.querySelectorAll(`#player div`)
  let isHorizontal = angle === 0

  const { shipBlock, valid, notTaken } = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

  if (valid && notTaken) {
    shipBlock.forEach(block => {
      block.classList.add('hover')
      setTimeout(() => block.classList.remove('hover'), 500);
    })
  }
}


// Game Logic
let gameOver = false
let playerTurn

// Start Game
function startGame() {
  if (playerTurn === undefined) {
    if (optionContainer.children.length != 0) {
      infoDisplay.textContent = "Please place all your pieces first"
    } else {
      const allComputerBlocks = document.querySelectorAll('#computer div')
      allComputerBlocks.forEach(block => block.addEventListener('click', playerAttack))
    }

    playerTurn = true
    turnDisplay.textContent = "Your turn"
    infoDisplay.textContent = "Attack the computer!"
  }
}
startButton.addEventListener('click', startGame)


let playerHits = []
let computerHits = []
const playerSunkenShips = []
const computerSunkenShips = []

function playerAttack(e) {
  if (!gameOver) {
    if (e.target.classList.contains('taken')) {
      e.target.classList.add('boom')
      infoDisplay.textContent = "You hit the computer ship!"
      let classes = Array.from(e.target.classList)
      classes = classes.filter(className => className !== 'block' && className !== 'taken' && className !== 'boom')
      playerHits.push(...classes)
      checkScore('player', playerHits, playerSunkenShips)
    }

    if (!e.target.classList.contains('taken')) {
      infoDisplay.textContent = "You missed!"
      e.target.classList.add('empty')
    }

    playerTurn = false
    const allComputerBlocks = document.querySelectorAll('#computer div')
    allComputerBlocks.forEach(block => block.removeEventListener('click', playerAttack))
    setTimeout(computerAttack, 3000)
  }
}

function computerAttack() {
  const allComputerBlocks = document.querySelectorAll('#computer div')
  if (!gameOver) {
    turnDisplay.textContent = "Computer's turn"
    infoDisplay.textContent = "The computer is attacking..."

    setTimeout(() => {

      let randomIndex = Math.floor(Math.random() * allPlayerBlocks.length)
      let randomBlock = allPlayerBlocks[randomIndex]
      if (randomBlock.classList.contains('taken') && !randomBlock.classList.contains('boom')) {
        randomBlock.classList.add('boom')
        infoDisplay.textContent = "Computer hit your ship!"
        let classes = Array.from(randomBlock.classList)
        classes = classes.filter(className => className !== 'block' && className !== 'taken' && className !== 'boom')
        computerHits.push(...classes)
        checkScore('computer', computerHits, computerSunkenShips)
      } else if (randomBlock.classList.contains('boom') && randomBlock.classList.contains('taken')) {
        computerAttack()
      } else {
        infoDisplay.textContent = "Computer missed!"
        randomBlock.classList.add('empty')
      }

      if (!randomBlock.classList.contains('taken')) {
        infoDisplay.textContent = "Computer missed!"
        randomBlock.classList.add('empty')
      }

      playerTurn = true
      allComputerBlocks.forEach(block => block.addEventListener('click', playerAttack))
    }, 3000)

    setTimeout(() => {
      playerTurn = true
      turnDisplay.textContent = "Your turn"
      infoDisplay.textContent = "Attack the computer!"
      allComputerBlocks.forEach(block => block.addEventListener('click', playerAttack))
    }, 6000);
  }
}


// Check for winner

function checkScore(user, userHits, userSunkenShips) {

  function checkShip(shipName, shipLength) {
    if (
      userHits.filter(storedShipName => storedShipName === shipName).length === shipLength
    ) {

      if (user === 'player') {
        infoDisplay.textContent = `You sunk the computer's ${shipName}!`
        playerHits = userHits.filter(storedShipName => storedShipName !== shipName)
      }

      if (user === 'computer') {
        infoDisplay.textContent = `The computer sunk your ${shipName}!`
        computerHits = userHits.filter(storedShipName => storedShipName !== shipName)
      }
      userSunkenShips.push(shipName)
    }
  }


  checkShip('destroyer', 2)
  checkShip('submarine', 3)
  checkShip('cruiser', 3)
  checkShip('battleship', 4)
  checkShip('carrier', 5)

  console.log('player hits', playerHits);
  console.log('player sunken ships', playerSunkenShips);

  if (playerSunkenShips.length === 5) {
    infoDisplay.textContent = "You sunk all the computer's ships. You WON!"
    gameOver = true
  }
  if (computerSunkenShips.length === 5) {
    infoDisplay.textContent = "The computer sunk all your ships. You LOST!"
    gameOver = true
  }


}
