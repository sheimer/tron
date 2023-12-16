import { WebSocketServer } from 'ws'

import { Game } from '../lib/Game.js'

export const wssGame = new WebSocketServer({
  noServer: true,
  perMessageDeflate: false,
})

wssGame.on('connection', (ws) => {
  ws.on('message', (msg, binary) => {
    msg = JSON.parse(msg.toString())
    if (msg.action === 'start') {
      const game = new Game(ws)
      game.run()
    } else if (msg.action === 'init') {
      console.log(msg.payload)
    }
  })
})
