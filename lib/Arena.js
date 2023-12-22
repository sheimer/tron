import { Explosion } from './Explosion.js'

export class Arena {
  constructor({ size, ondraw, onfinish }) {
    this.size = size
    this.xMax = this.size.x - 1
    this.yMax = this.size.y - 1
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
  }

  init() {
    this.escaped = []

    this.fields = []
    this.fieldChanges = []

    for (let x = 0; x < this.size.x; x++) {
      this.fields[x] = []
      for (let y = 0; y < this.size.y; y++) {
        if (x === 0 || y === 0 || x === this.xMax || y === this.yMax) {
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

  killPlayer(index, player, killedBy) {
    player.alive = false
    if (killedBy >= 0) {
      player.killedBy = killedBy
    }
    this.explosions.push(new Explosion({ id: index, pos: { ...player.pos } }))
  }

  run() {
    let finished = 0
    let playersLeft = 0
    const prevPositions = []

    // calc new positions --> loop players, set their new pos
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i]
      if (player.alive) {
        prevPositions.push({ ...player.pos })
        player.nextPos()
      }
    }

    // calc explosions
    this.explosions = this.explosions.filter(
      (explosion) => explosion.particles.length,
    )
    const renderParticle = (pos, value) => {
      const x = Math.round(pos.x)
      const y = Math.round(pos.y)
      if (x < 0 || x > this.xMax || y < 0 || y > this.yMax) {
        return
      }
      this.fields[x][y] = value
      this.fieldChanges.push([x, y, value])
    }
    for (let i = 0; i < this.explosions.length; i++) {
      const explosion = this.explosions[i]
      explosion.nextPos()
      for (let p = 0; p < explosion.particles.length; p++) {
        if (explosion.particles[p].prev !== null) {
          renderParticle(explosion.particles[p].prev, -1)
        }
        if (
          !explosion.particles[p].finished &&
          explosion.particles[p].pos !== null
        ) {
          renderParticle(explosion.particles[p].pos, -3)
        }
      }
    }

    // check on collisions --> incl. 2 in 1 spot detection
    const resetPlayers = []
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i]
      if (player.alive) {
        const x = player.pos.x
        const y = player.pos.y
        if (this.fields[x][y] !== -1) {
          const killedBy = this.fields[x][y] >= 0 ? this.fields[x][y] : -1
          this.killPlayer(i, player, killedBy)
          resetPlayers.push(i)
          if (killedBy >= 0 && killedBy < i) {
            const killer = this.players[killedBy]
            if (x === killer.pos.x && y === killer.pos.y) {
              // both players tried to occupy same spot in one frame, but as "killedBy" player moved there it was not yet occupied...
              this.killPlayer(player.killedBy, killer, i)
              resetPlayers.push(player.killedBy)
            }
          }
        } else {
          if (
            x === 0 ||
            x === this.size.x - 1 ||
            y === 0 ||
            y === this.size.y - 1
          ) {
            player.escaped = true
            this.escaped.push(i)
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
    if (!this.explosions.length && (finished || playersLeft <= 1)) {
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
    if (this.escaped.length) {
      this.escaped.forEach((id) =>
        messages.push(this.players[id].name + ' escaped!'),
      )
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
