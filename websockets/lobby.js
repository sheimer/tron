import WebSocket, { WebSocketServer } from 'ws'

import { gameServer } from '../lib/gameServer.js'

export const wssLobby = new WebSocketServer({
  noServer: true,
  allowSynchronousEvents: true,
  perMessageDeflate: false,
})

const broadcast = (ws, message, all = true) => {
  wssLobby.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && (all || ws !== client)) {
      client.send(message)
    }
  })
}

gameServer.setChangeHandler(() => {
  broadcast(
    null,
    JSON.stringify({ action: 'list', payload: gameServer.getGameList() }),
  )
})

wssLobby.on('connection', (ws) => {
  ws.send(JSON.stringify({ action: 'list', payload: gameServer.getGameList() }))

  ws.on('message', (msg, binary) => {
    console.log('make user input secure...')
    const { action, payload } = JSON.parse(msg.toString())
    switch (action) {
      case 'create': {
        const { name, size, interval, isPublic } = payload
        const key = gameServer.createGame({
          name,
          size,
          interval,
          isPublic,
        })
        broadcast(
          ws,
          JSON.stringify({
            action: 'list',
            payload: gameServer.getGameList(),
          }),
          false,
        )
        ws.send(JSON.stringify({ action: 'gameCreated', payload: key }))
        break
      }
      default:
        ws.send('invalid action')
    }
  })
})
