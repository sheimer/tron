import { WebSocketServer } from 'ws'
import { randomBytes } from 'crypto'

import { Game } from '../lib/Game.js'

const games = {}

export const wssGame = new WebSocketServer({
  noServer: true,
  allowSynchronousEvents: true,
  perMessageDeflate: false,
})

wssGame.on('connection', (ws) => {
  const key = randomBytes(4).toString('hex')
  ws.on('message', (msg, binary) => {
    msg = JSON.parse(msg.toString())
    if (msg.action === 'init') {
      games[key] = new Game({
        size: msg.payload.size,
        interval: msg.payload.interval,
        ondraw: (changes) => {
          ws.send(JSON.stringify({ action: 'draw', key, payload: changes }))
        },
        onfinish: (messages) => {
          ws.send(JSON.stringify({ action: 'finish', key, payload: messages }))
        },
      })
    } else if (msg.action === 'setPlayers') {
      games[key].setPlayers(msg.payload)
    } else if (msg.action === 'start') {
      games[key].start()
    } else if (msg.action === 'changeDir') {
      games[key].changeDir(msg.payload)
    }
  })
})
