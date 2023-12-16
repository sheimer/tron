import { Player } from '../public/javascripts/shared/Player.js'

export const Game = class {
  constructor(ws) {
    this.ws = ws
    this.interval = 50
    this.lastaction = null
    this.gameStarted = null

    const player = new Player({
      name: 'hidden',
      color: 'rgb(0,0,0)',
      left: 75, // k
      right: 76, // l
      pos: { x: 40, y: 120 },
      move: 1,
    })
    console.log(player)
  }

  run() {
    const current = new Date().getTime()
    if (this.gameStarted === null) {
      this.gameStarted = current
    } else if (current - this.gameStarted > 10000) {
      this.lastaction = null
      this.gameStarted = null
      return
    }
    const timediff =
      this.lastaction === null ? this.interval : current - this.lastaction

    if (timediff >= this.interval) {
      this.lastaction = current
      const timestring = new Date(current).toISOString()
      this.ws.send(`calculating game stuff at: ${timestring} - ${timediff}`)
    }

    setTimeout(() => {
      this.run()
    }, 0)
  }
}
