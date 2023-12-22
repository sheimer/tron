import { log } from '../include.js'

const { protocol, hostname, port } = window.location

export const wsGame = {
  socket: null,
  connected: false,

  connect: ({ onmessage, ...args }) => {
    wsGame.socket = new WebSocket(
      `${protocol === 'https' ? 'wss' : 'ws'}://${hostname}${
        port.length ? ':' + port : ''
      }/ws/game`,
    )

    wsGame.socket.binaryType = 'blob'

    wsGame.socket.addEventListener('open', (event) => {
      wsGame.connected = true
      wsGame.init(args)
    })

    wsGame.socket.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      onmessage(msg)
    })
  },

  init: (props) => {
    if (!wsGame.connected) {
      log('wsGame not connected')
      return
    }
    const msg = JSON.stringify({ action: 'init', payload: props })
    wsGame.socket.send(msg)
  },

  setPlayers: (players) => {
    if (!wsGame.connected) {
      log('wsGame not connected')
      return
    }

    wsGame.socket.send(
      JSON.stringify({ action: 'setPlayers', payload: players }),
    )
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
