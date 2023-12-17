import { log } from './include.js'

let pingDiv = null

export const websocket = {
  socket: new WebSocket('ws://localhost:3000/ws/echo'),
  connected: false,
  ping: (div) => {
    if (div) {
      pingDiv = div
    }
    if (!websocket.connected) {
      log('websocket not connected')
      return
    }

    websocket.socket.send(new Date().getTime())
  },
}

websocket.socket.addEventListener('open', (event) => {
  websocket.connected = true
})

websocket.socket.addEventListener('message', (event) => {
  if (pingDiv !== null) {
    pingDiv.innerHTML = `${new Date().getTime() - event.data}ms ping`
  } else {
    log(`ping: ${new Date().getTime() - event.data}ms`)
  }
})

export const websocketGame = {
  socket: null,
  connected: false,

  connect: ({ onmessage, ...args }) => {
    websocketGame.socket = new WebSocket('ws://localhost:3000/ws/game')

    websocketGame.socket.addEventListener('open', (event) => {
      websocketGame.connected = true
      websocketGame.init(args)
    })

    websocketGame.socket.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      onmessage(msg)
    })
  },

  init: (props) => {
    if (!websocketGame.connected) {
      log('websocketGame not connected')
      return
    }
    const msg = JSON.stringify({ action: 'init', payload: props })
    websocketGame.socket.send(msg)
  },

  start: () => {
    if (!websocketGame.connected) {
      log('websocketGame not connected')
      return
    }

    websocketGame.socket.send(JSON.stringify({ action: 'start' }))
  },

  changeDir: ({ id, dir }) => {
    if (!websocketGame.connected) {
      log('websocketGame not connected')
      return
    }

    websocketGame.socket.send(
      JSON.stringify({ action: 'changeDir', payload: { id, dir } }),
    )
  },
}
