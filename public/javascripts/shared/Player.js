export class Player {
  constructor({ name, color, left, right, pos, move }) {
    this.defaults = {
      pos: { ...pos },
      move,
    }
    this.dir = { x: 0, y: 0 }
    this.id = null
    this.name = name
    this.color = color
    this.left = left // keycode for moving left
    this.right = right // keycode for moving right

    this.init()
  }

  init() {
    this.pos = { ...this.defaults.pos }
    this.move = this.defaults.move
    this.alive = true
    this.escaped = false
    this.killedBy = -1
    this.setDir()
  }

  reset() {
    this.init()
  }

  setDir() {
    const even = this.move % 2 === 0
    this.dir.x = even ? 0 : this.move === 1 ? 1 : -1
    this.dir.y = even ? (this.move === 2 ? 1 : -1) : 0
  }

  nextCoords() {
    for (const axis of ['x', 'y']) {
      this.pos[axis] += this.dir[axis]
    }
  }

  changeDir(dir) {
    const change = dir === 'left' ? -1 : 1
    this.move = (this.move + change + 4) % 4
    this.setDir()
  }
}
