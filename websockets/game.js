import { WebSocketServer } from 'ws'
import { randomBytes } from 'crypto'

import { Game } from '../lib/Game.js'

const games = {}

export const wssGame = new WebSocketServer({
  noServer: true,
  perMessageDeflate: false,
})

wssGame.on('connection', (ws) => {
  const key = randomBytes(4).toString('hex')
  ws.on('message', (msg, binary) => {
    msg = JSON.parse(msg.toString())
    if (msg.action === 'init') {
      games[key] = new Game({
        size: msg.payload.size,
        players: msg.payload.players,
        interval: msg.payload.interval,
        ondraw: (fields) => {
          ws.send(JSON.stringify({ action: 'draw', key, payload: fields }))
        },
        onfinish: (messages) => {
          ws.send(JSON.stringify({ action: 'finish', key, payload: messages }))
        },
      })
    } else if (msg.action === 'start') {
      games[key].start()
    } else if (msg.action === 'changeDir') {
      games[key].changeDir(msg.payload)
    }
  })
})