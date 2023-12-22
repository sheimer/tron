import WebSocket, { WebSocketServer } from 'ws'

import { gameServer } from '../lib/gameServer.js'

export const wssGame = new WebSocketServer({
  noServer: true,
  allowSynchronousEvents: true,
  perMessageDeflate: false,
})

const broadcast = (ws, message, all = true) => {
  wssGame.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client?.gameId === ws.gameId &&
      (all || ws !== client)
    ) {
      client.send(message)
    }
  })
}

wssGame.on('connection', (ws) => {
  const game = gameServer.getGame(ws.gameId)
  ws.on('message', (msg, binary) => {
    const { action, payload } = JSON.parse(msg.toString())
    switch (action) {
      case 'init': {
        game.connect({
          ondraw: (changes) => {
            broadcast(ws, JSON.stringify({ action: 'draw', payload: changes }))
          },
          onfinish: (messages) => {
            broadcast(
              ws,
              JSON.stringify({ action: 'finish', payload: messages }),
            )
          },
        })
        ws.send(JSON.stringify({ action: 'setState', payload: 'connected' }))
        break
      }
      case 'setPlayers': {
        game.setPlayers(payload)
        ws.send(JSON.stringify({ action: 'setState', payload: 'serverReady' }))
        break
      }
      case 'start': {
        broadcast(
          ws,
          JSON.stringify({ action: 'setState', payload: 'running' }),
        )
        game.start()
        break
      }
      case 'changeDir': {
        game.changeDir(payload)
        break
      }
      default:
        ws.send('invalid action')
    }
  })
})
