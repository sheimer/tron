const express = require('express')
const router = express.Router()

const Game = class {
  constructor(ws) {
    this.ws = ws
    this.interval = 50
    this.lastaction = null
    this.gameStarted = null
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

// TODO: dont use express-ws anymore, instead build like on
// https://github.com/websockets/ws#multiple-servers-sharing-a-single-https-server
router.ws('/echo', function (ws, req) {
  ws.on('message', function (msg) {
    ws.send(msg)
  })

  const game = new Game(ws)
  game.run()
})

module.exports = router
