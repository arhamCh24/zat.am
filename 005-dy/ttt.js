class Game {
  constructor (p1, p2) {
    this.p1 = p1
    this.p2 = p2
    this.board = [[null, null, null], [null, null, null], [null, null, null]]
	this.player = this.p1
    this.sym = 'x'
  }

  turn (row, col) {
    this.board[row][col] = this.sym
  }

  nextPlayer () {
    this.player = this.player === this.p1 ? this.p2 : this.p1
    this.sym = this.sym === 'x' ? '☺' : 'x'
  }

  hasWinner () {
    return this.rowWin() || this.colWin() || this.diagWin()
  }

  rowWin () {
    let win = false
    for (let r = 0; r < 3; r++) {
      const row = this.board[r]
      if (row[0] === null) { continue }
      win = win || (row[0] === row[1] && row[0] === row[2])
    }

    return win
  }

  colWin () {
    let win = false
    for (let c = 0; c < 3; c++) {
      if (this.board[0][c] === null) { continue }
      win = win || (this.board[0][c] === this.board[1][c] && this.board[0][c] === this.board[2][c])
    }

    return win
  }

  diagWin () {
    const b = this.board
    return ((b[0][0] !== null && b[0][0] === b[1][1] && b[0][0] === b[2][2]) ||
            (b[0][2] !== null && b[0][2] === b[1][1] && b[0][2] === b[2][0]))
  }
}
