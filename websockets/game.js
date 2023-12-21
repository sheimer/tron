import WebSocket, { WebSocketServer } from 'ws'
import { randomBytes } from 'crypto'

import { Game } from '../lib/Game.js'

const games = {}
const key = randomBytes(4).toString('hex')

export const wssGame = new WebSocketServer({
  noServer: true,
  allowSynchronousEvents: true,
  perMessageDeflate: false,
})

const broadcast = (gameId, message) => {
  wssGame.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client?.gameId === gameId) {
      client.send(message)
    }
  })
}

wssGame.on('connection', (ws) => {
  ws.gameId = key
  console.log(
    'gameId either put to client after game create or set on game connect',
  )
  ws.on('message', (msg, binary) => {
    msg = JSON.parse(msg.toString())
    // list games
    // create game
    // connectToGame
    if (msg.action === 'init') {
      if (typeof games[key] === 'undefined') {
        games[key] = new Game({
          size: msg.payload.size,
          interval: msg.payload.interval,
          ondraw: (changes) => {
            broadcast(
              key,
              JSON.stringify({ action: 'draw', key, payload: changes }),
            )
          },
          onfinish: (messages) => {
            broadcast(
              key,
              JSON.stringify({ action: 'finish', key, payload: messages }),
            )
          },
        })
      }
      ws.send(JSON.stringify({ action: 'setState', payload: 'connected' }))
    } else if (msg.action === 'setPlayers') {
      games[key].setPlayers(msg.payload)
      ws.send(JSON.stringify({ action: 'setState', payload: 'serverReady' }))
    } else if (msg.action === 'start') {
      broadcast(key, JSON.stringify({ action: 'setState', payload: 'running' }))
      games[key].start()
    } else if (msg.action === 'changeDir') {
      games[key].changeDir(msg.payload)
    }
  })
})
