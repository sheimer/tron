import { log } from '../include.js'

const { protocol, hostname, port } = window.location

export const wsLobby = {
  socket: null,
  connected: false,

  connect: ({ onmessage }) => {
    wsLobby.socket = new WebSocket(
      `${protocol === 'https' ? 'wss' : 'ws'}://${hostname}${
        port.length ? ':' + port : ''
      }/ws/lobby`,
    )

    wsLobby.socket.binaryType = 'blob'

    wsLobby.socket.addEventListener('open', (event) => {
      wsLobby.connected = true
    })

    wsLobby.socket.addEventListener('close', (event) => {
      wsLobby.connected = false
      wsLobby.socket = null
    })

    wsLobby.socket.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      onmessage(msg)
    })
  },

  createGame: (properties) => {
    if (!wsLobby.connected) {
      log('wsLobby not connected!')
      return
    }
    wsLobby.socket.send(
      JSON.stringify({
        action: 'create',
        payload: properties,
      }),
    )
  },

  disconnect: () => {
    if (wsLobby.connected) {
      wsLobby.socket.close()
    }
  },
}
