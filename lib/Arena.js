import { fisherYatesShuffle } from '../public/javascripts/include.js'
import { Explosion } from './Explosion.js'

const startPositions = [
  { x: 50, y: 50 },
  { x: 270, y: 50 },
  { x: 50, y: 100 },
  { x: 270, y: 100 },
  { x: 50, y: 150 },
  { x: 270, y: 150 },
]
const availablePostions = [
  [2, 3],
  [1, 2, 5],
  [0, 1, 4, 5],
  [0, 1, 2, 4, 5],
  [0, 1, 2, 3, 4, 5],
]

export class Arena {
  constructor({ size }) {
    this.size = size
    this.xMax = this.size.x - 1
    this.yMax = this.size.y - 1
    this.ondraw = null
    this.onfinish = null
    this.onreset = null
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
    this.deadPlayers = 0

    this.init()
  }

  addHandler({ ondraw, onfinish, onreset }) {
    if (
      this.ondraw === null ||
      this.onfinish === null ||
      this.onreset === null
    ) {
      this.ondraw = ondraw
      this.onfinish = onfinish
      this.onreset = onreset
    }
  }

  init() {
    this.escaped = []
    this.deadPlayers = 0

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

    this.players.forEach((player) => {
      if (player.pos !== null) {
        this.fields[player.pos.x][player.pos.y] = this.players.length - 1
        this.fieldChanges.push([
          player.pos.x,
          player.pos.y,
          this.players.length - 1,
        ])
      }
    })

    this.draw()
  }

  reset({ finish } = {}) {
    if (finish) {
      this.finish()
    }

    const positions = {}

    if (this.players?.length && this.players.length > 1) {
      const randomPositions = fisherYatesShuffle([
        ...availablePostions[this.players.length - 2],
      ])

      for (let i = 0; i < this.players.length; i++) {
        const player = this.players[i]
        const posId = randomPositions[i]
        positions[player.id] = posId
        const pos = { ...startPositions[posId] }
        const move = posId % 2 === 0 ? 1 : 3
        player.reset({ pos, move })
      }
    }
    this.onreset(positions)
    this.init()
  }

  draw() {
    const changes = [...this.fieldChanges]
    this.fieldChanges = []
    if (typeof this.ondraw === 'function') {
      this.ondraw(changes)
    }
  }

  addPlayer(player) {
    this.players.push(player)
  }

  killPlayer(index, player, killedBy) {
    player.deadPlayers = this.deadPlayers
    player.alive = false
    if (killedBy >= 0) {
      const killer = this.players[killedBy]
      const killedOn = `${player.pos.x}-${player.pos.y}`

      player.killedBy = killer.killzone.includes(killedOn) ? killedBy : -1
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
    let addDeadPlayers = 0
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i]
      if (player.alive) {
        const x = player.pos.x
        const y = player.pos.y
        if (this.fields[x][y] !== -1) {
          addDeadPlayers++

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

    this.deadPlayers += addDeadPlayers

    for (let j = 0; j < resetPlayers; j++) {
      const id = resetPlayers[j]
      this.players[id].pos = prevPositions[id]
      this.players[id].killzone.fill(null)
    }

    this.draw()

    // finished...
    if (finished || (!this.explosions.length && playersLeft <= 1)) {
      this.finish()
    }
  }

  finish() {
    const stats = {
      kills: {},
      deadOnDeath: {},
      escaped: [],
      winner: null,
    }
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i]
      stats.deadOnDeath[player.id] = player.deadPlayers
      if (player.killedBy >= 0) {
        const killer = this.players[player.killedBy].id
        stats.kills[killer] = player.id
      }
    }
    if (this.escaped.length) {
      this.escaped.forEach((index) =>
        stats.escaped.push(this.players[index].id),
      )
    } else {
      for (let i = 0; i < this.players.length; i++) {
        const player = this.players[i]
        if (player.alive) {
          stats.winner = player.id
        }
      }
    }
    this.onfinish(stats)
  }
}
