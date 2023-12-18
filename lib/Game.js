import { Arena } from './Arena.js'
import { Player } from '../public/javascripts/shared/Player.js'

export const Game = class {
  constructor({ size, players, interval, ondraw, onfinish }) {
    this.interval = interval
    this.timeout = null
    this.lastaction = null
    this.gameStarted = null
    this.running = false

    this.arena = new Arena({
      size,
      ondraw,
      onfinish: (messages) => {
        this.running = false
        onfinish(messages)
      },
    })
    players.forEach((player, index) =>
      this.arena.addPlayer(new Player({ ...player, id: index })),
    )
  }

  start() {
    if (this.timeout !== null) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    this.arena.reset(this.running)
    this.running = false
    this.lastaction = null
    this.gameStarted = null
    this.run()
  }

  run() {
    const current = new Date().getTime()
    if (this.gameStarted === null) {
      this.gameStarted = current
      this.running = true
    } else if (!this.running) {
      this.lastaction = null
      this.gameStarted = null
      return
    }

    const timediff =
      this.lastaction === null ? this.interval : current - this.lastaction

    if (timediff >= this.interval && this.running) {
      this.lastaction = current
      this.arena.run()
    }

    this.timeout = setTimeout(() => {
      if (this.running) {
        this.run()
      }
    }, 0)
  }

  changeDir({ id, dir }) {
    this.arena.players[id].changeDir(dir)
  }
}
