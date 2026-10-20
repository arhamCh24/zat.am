function startGame() {
  const nameDialog = document.getElementById('name-dialog')
  const nameError = document.getElementById('name-dialog-error')
  const playerOneInput = document.getElementById('player-one-name')
  const playerTwoInput = document.getElementById('player-two-name')

  playerOneInput.focus()

  nameDialog.addEventListener('submit', (event) => {
    event.preventDefault()

    const p1 = playerOneInput.value.trim()
    const p2 = playerTwoInput.value.trim()

    if (!p1 || !p2 || p1.localeCompare(p2, undefined, { sensitivity: 'accent' }) === 0) {
      nameError.hidden = false
      ;(p1 ? playerTwoInput : playerOneInput).focus()
      return
    }

    nameError.hidden = true
    document.getElementById('name-dialog-backdrop').hidden = true
    initializeBoard(p1, p2)
  })
}

function initializeBoard(p1, p2) {
  const game = new Game(p1, p2)
  const turn = document.getElementById('turn')
  const player = document.getElementById('player')
  player.innerText = game.player

  document.querySelectorAll('.ttt-board td').forEach((cell) => {
    cell.onclick = () => {
      if (cell.innerText) return

      cell.innerText = game.sym
      cell.onclick = undefined

      const row = Number(cell.dataset.row)
      const col = Number(cell.dataset.col)
      game.turn(row, col)

      if (game.hasWinner()) {
        document.getElementById('jayaH').innerText = 'जयतु संस्कृतम् ।'
        turn.style.color = 'orange'
        turn.innerText = `कस्य जयः? - kasya jayaH - ${game.player}!!!`
        document.querySelectorAll('.ttt-board td').forEach((boardCell) => {
          boardCell.onclick = undefined
          if (boardCell.innerText === game.sym) boardCell.style.color = 'orange'
        })
      } else {
        game.nextPlayer()
        player.innerText = game.player
      }
    }
  })
}

document.addEventListener('zatam:navbarready', startGame, { once: true })
