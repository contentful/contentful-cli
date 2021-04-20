/* the secret command :) */

const blessed = require('blessed')

const SIZE = 12
let INTERVAL = 400
let DIRECTION
const EMPTY = '☐'
const SNAKE = '█'
const FOOD = '@'
let interval
let score = 0

module.exports.handler = function () {
  const screen = blessed.screen({
    smartCSR: true
  })

  screen.title = 'SNAKE!'

  const board = createBoard(screen)

  const game = blessed.box({
    content: board.render(),
    border: {
      type: 'line'
    },
    style: {
      border: {
        fg: 'white'
      },
      fg: 'red'
    }
  })

  screen.append(game)

  interval = setInterval(function () {
    game.setContent(board.update())
    screen.render()
  }, INTERVAL)

  screen.key(['left', 'right', 'up', 'down'], function (ch, key) {
    DIRECTION = key.full
  })

  // Quit on Escape, q, or Control-C.
  screen.key(['escape', 'q', 'C-c'], function () {
    return process.exit(0)
  })

  screen.render()

  return Promise.resolve()
}

function replaceAtIdx(str, replacement, idx) {
  return `${str.substring(0, idx)}${replacement}${str.substring(idx + 1)}`
}

function createBoard() {
  const tiles = Math.pow(SIZE, 2)
  let board = EMPTY.repeat(tiles)
  // put snake in a random position
  const snake = [random(tiles)]
  board = replaceAtIdx(board, SNAKE, snake[0])
  // put food somewhere!
  createFood()

  function createFood() {
    let position = random(tiles)
    if (board[position] === EMPTY) {
      board = replaceAtIdx(board, FOOD, random(tiles))
    } else {
      createFood()
    }
  }

  function move(targetExists, newPosition) {
    switch (targetExists && board[newPosition]) {
      case EMPTY:
        board = replaceAtIdx(board, SNAKE, newPosition)
        board = replaceAtIdx(board, EMPTY, snake[snake.length - 1])
        snake.unshift(newPosition)
        snake.pop()
        return render()
      case FOOD:
        board = replaceAtIdx(board, SNAKE, newPosition)
        snake.unshift(newPosition)
        incrementScore()
        createFood()
        return render()
      default:
        return endGame()
    }
  }

  function render() {
    const pattern = new RegExp('.{1,' + SIZE + '}', 'g')
    const game = board
      .match(pattern)
      .map(row => row.split('').join(' '))
      .join('\n')

    return `${game}\n\n\nScore: ${score}`
  }

  function update() {
    if (DIRECTION === 'left') {
      const targetExists = snake[0] % SIZE > 0
      const newPosition = snake[0] - 1
      return move(targetExists, newPosition)
    } else if (DIRECTION === 'right') {
      const targetExists = snake[0] % SIZE < SIZE - 1
      const newPosition = snake[0] + 1
      return move(targetExists, newPosition)
    } else if (DIRECTION === 'up') {
      const targetExists = snake[0] - SIZE > 0
      const newPosition = snake[0] - SIZE
      return move(targetExists, newPosition)
    } else if (DIRECTION === 'down') {
      const targetExists = snake[0] + SIZE < tiles
      const newPosition = snake[0] + SIZE
      return move(targetExists, newPosition)
    }
    return render()
  }

  return {
    render: render,
    update: update
  }
}

function incrementScore() {
  score += 1
}

function endGame() {
  if (interval) {
    clearInterval(interval)
  }
  return `GAME OVER. SCORE:${score}`
}

function random(n) {
  return Math.floor(Math.random() * n)
}
