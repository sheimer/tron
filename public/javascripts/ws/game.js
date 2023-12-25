import { log } from '../include.js'

const { protocol, hostname, port } = window.location

export const wsGame = {
  socket: null,
  connected: false,

  connect: ({ onmessage, key, ...args }) => {
    wsGame.socket = new WebSocket(
      `${protocol === 'https' ? 'wss' : 'ws'}://${hostname}${
        port.length ? ':' + port : ''
      }/ws/game/${key}`,
    )

    wsGame.socket.binaryType = 'blob'

    wsGame.socket.addEventListener('open', (event) => {
      wsGame.connected = true
    })

    wsGame.socket.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      onmessage(msg)
    })
  },

  addPlayer: (player) => {
    if (!wsGame.connected) {
      log('wsGame not connected')
      return
    }

    wsGame.socket.send(JSON.stringify({ action: 'addPlayer', payload: player }))
  },

  start: () => {
    if (!wsGame.connected) {
      log('wsGame not connected')
      return
    }

    wsGame.socket.send(JSON.stringify({ action: 'start' }))
  },

  changeDir: ({ id, dir }) => {
    if (!wsGame.connected) {
      log('wsGame not connected')
      return
    }

    wsGame.socket.send(
      JSON.stringify({ action: 'changeDir', payload: { id, dir } }),
    )
  },
}
