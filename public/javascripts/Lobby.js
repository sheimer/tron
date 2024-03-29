import { log } from './include.js'
import { wsLobby } from './ws/lobby.js'
import { defaultProperties as gameProperties } from './Game.js'

export class Lobby {
  constructor({ onListReceived, onGameCreated, onConnect }) {
    this.onListReceived = onListReceived
    this.onGameCreated = onGameCreated
    this.onConnect = onConnect

    wsLobby.connect({
      onconnect: () => {
        this.onConnect()
      },
      onmessage: (msg) => {
        const { action, payload } = msg
        switch (action) {
          case 'list': {
            this.onListReceived(payload)
            break
          }
          case 'gameCreated': {
            this.onGameCreated(payload)
            break
          }
          default:
            log('invalid action received in lobby websocket: ', action)
        }
      },
    })
  }

  createGame(gameName) {
    wsLobby.createGame({
      name: gameName,
      size: gameProperties.size,
      interval: Math.round(1000 / gameProperties.fps),
      isPublic: true,
    })
  }

  disconnect() {
    wsLobby.disconnect()
  }
}
