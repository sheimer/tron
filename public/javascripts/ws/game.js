import { log } from '../include.js'

const { protocol, hostname, port } = window.location

const maxConnectRetries = 20
const reconnectInterval = 1000

export const wsGame = {
  socket: null,
  connectionRetries: 0,
  windowClosing: false,
  connected: false,

  connect: ({ onmessage, key, ...args }) => {
    wsGame.socket = new WebSocket(
      `${protocol.startsWith('https') ? 'wss' : 'ws'}://${hostname}${
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

    wsGame.socket.addEventListener('close', (event) => {
      if (
        !wsGame.windowClosing &&
        wsGame.connectionRetries < maxConnectRetries
      ) {
        setTimeout(() => {
          console.log('connect game from close event')
          wsGame.connect({ onmessage, key, ...args })
        }, reconnectInterval)
        wsGame.connectionRetries++
      }
    })

    window.addEventListener('beforeunload', () => {
      wsGame.windowClosing = true
    })
  },

  setInterval: (interval) => {
    if (!wsGame.connected) {
      log('wsGame not connected')
      return
    }

    wsGame.socket.send(
      JSON.stringify({ action: 'setInterval', payload: interval }),
    )
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
