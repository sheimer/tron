import { Explosion } from './Explosion.js'

export class Arena {
  constructor({ size, ondraw, onfinish }) {
    this.size = size
    this.ondraw = ondraw
    this.onfinish = onfinish
    this.players = []
    this.explosions = []
    this.fields = null
    this.fieldChanges = null
    /*
      2 dimensional array representing playing field, each field containing:
        -3:  explosion
        -2:  border
        -1:  empty
        0-5: player
    */
    this.escaped = null
    this.init()
  }

  init() {
    this.escaped = -1

    this.fields = []
    this.fieldChanges = []

    const xMax = this.size.x - 1
    const yMax = this.size.y - 1
    for (let x = 0; x < this.size.x; x++) {
      this.fields[x] = []
      for (let y = 0; y < this.size.y; y++) {
        if (x === 0 || y === 0 || x === xMax || y === yMax) {
          this.fields[x][y] = -2
          this.fieldChanges.push([x, y, -2])
        } else {
          this.fields[x][y] = -1
          this.fieldChanges.push([x, y, -1])
        }
      }
    }

    this.draw()
  }

  reset(finish) {
    if (finish) {
      this.finish()
    }
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].reset()
    }
    this.init()
  }

  draw() {
    const changes = [...this.fieldChanges]
    this.fieldChanges = []
    this.ondraw(changes)
  }

  addPlayer(player) {
    this.players.push(player)
    this.fields[player.pos.x][player.pos.y] = this.players.length - 1
    this.fieldChanges.push([
      player.pos.x,
      player.pos.y,
      this.players.length - 1,
    ])
  }

  run() {
    let finished = 0
    let playersLeft = 0
    const prevPositions = []

    // calc new positions --> loop players, set their new pos
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i]
      if (player.alive) {
        prevPositions.push(`${player.pos.x}-${player.pos.y}`)
        player.nextPos()
      }
    }

    // calc explosions

    // check on collisions --> incl. 2 in 1 spot detection
    const resetPlayers = []

    console.log('for some reason double collision not working anymore')
    console.log('possibly new start positions')
    console.log('possibly because of player resetting?!')
    console.log('straaaaange!!!')
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i]
      if (player.alive) {
        const x = player.pos.x
        const y = player.pos.y
        if (this.fields[x][y] !== -1) {
          player.alive = false
          player.killedBy = this.fields[x][y]
          resetPlayers.push(i)
          this.explosions.push(new Explosion({ id: i, pos: { ...player.pos } }))
        } else {
          if (
            x === 0 ||
            x === this.size.x - 1 ||
            y === 0 ||
            y === this.size.y - 1
          ) {
            player.escaped = true
            this.escaped = i
            finished = 1
          } else {
            playersLeft++
          }
          this.fields[x][y] = i
          this.fieldChanges.push([x, y, i])
        }
      }
    }

    for (let j = 0; j < resetPlayers; j++) {
      const id = resetPlayers[j]
      this.players[id].pos = prevPositions[id]
    }

    this.draw()

    // finished...
    if (finished || playersLeft <= 1) {
      this.finish()
    }
  }

  finish() {
    const messages = []
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i]
      if (player.killedBy !== -1) {
        const killer =
          player.killedBy === -2 ? 'wall' : this.players[player.killedBy].name
        messages.push(player.name + ' killed by ' + killer + '!')
      }
    }
    if (this.escaped >= 0) {
      messages.push(this.players[this.escaped].name + ' escaped!')
    } else {
      for (let i = 0; i < this.players.length; i++) {
        const player = this.players[i]
        if (player.alive) {
          messages.push(player.name + ' wins!')
        }
      }
    }
    this.onfinish(messages)
  }
}
