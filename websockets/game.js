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
    onfinish: (stats) => {
      broadcast(ws.gameId, JSON.stringify({ action: 'finish', payload: stats }))
    },
    onreset: (positions) => {
      broadcast(
        ws.gameId,
        JSON.stringify({ action: 'reset', payload: positions }),
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
        broadcast(
          ws.gameId,
          JSON.stringify({
            action: 'gameinfo',
            payload: gameServer.getGameInfo(ws.gameId),
          }),
        )
        break
      }
      case 'start': {
        game.reset()
        broadcast(
          ws.gameId,
          JSON.stringify({ action: 'setState', payload: 'running' }),
        )
        setTimeout(() => {
          game.start()
        }, 1000)
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
