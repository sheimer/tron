export class Player {
  constructor({ id, name, color, left, right, pos, move }) {
    this.defaults = {
      pos: { ...pos },
      move,
    }
    this.dirStack = []
    this.id = id
    this.name = name
    this.color = color
    this.left = left // keycode for moving left
    this.right = right // keycode for moving right

    this.init()
  }

  init() {
    this.pos = { ...this.defaults.pos }
    this.move = this.defaults.move
    this.dirStack = []
    this.setDir()

    this.alive = true
    this.escaped = false
    this.killedBy = -1
  }

  reset() {
    this.init()
  }

  setDir() {
    const even = this.move % 2 === 0
    this.dirStack.push({
      x: even ? 0 : this.move === 1 ? 1 : -1,
      y: even ? (this.move === 2 ? 1 : -1) : 0,
    })
  }

  nextCoords() {
    const nextDir =
      this.dirStack.length > 1 ? this.dirStack.shift() : this.dirStack[0]
    for (const axis of ['x', 'y']) {
      this.pos[axis] += nextDir[axis]
    }
  }

  changeDir(dir) {
    const change = dir === 'left' ? -1 : 1
    this.move = (this.move + change + 4) % 4
    this.setDir()
  }
}
