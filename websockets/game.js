import WebSocket, { WebSocketServer } from 'ws'

import { gameServer } from '../lib/gameServer.js'

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
  const game = gameServer.getGame(ws.gameId)
  game.connect({
    ondraw: (changes) => {
      broadcast(ws.gameId, JSON.stringify({ action: 'draw', payload: changes }))
    },
    onfinish: (messages) => {
      broadcast(
        ws.gameId,
        JSON.stringify({ action: 'finish', payload: messages }),
      )
    },
  })

  ws.send(
    JSON.stringify({
      action: 'serverState',
      payload: gameServer.getGameInfo(ws.gameId),
    }),
  )

  ws.on('message', (msg, binary) => {
    const { action, payload } = JSON.parse(msg.toString())
    switch (action) {
      case 'addPlayer': {
        game.addPlayer(payload)
        ws.send(
          JSON.stringify({
            action: 'gameinfo',
            payload: gameServer.getGameInfo(ws.gameId),
          }),
        )
        break
      }
      case 'start': {
        broadcast(
          ws.gameId,
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
