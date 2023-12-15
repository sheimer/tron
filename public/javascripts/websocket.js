import { log } from './include.js'

export const websocket = {
  socket: new WebSocket('ws://localhost:3000/ws/echo'),
  connected: false,
  ping: () => {
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
  log(`ping: ${new Date().getTime() - event.data}ms`)
})

export const websocketGame = {
  socket: new WebSocket('ws://localhost:3000/ws/game'),
  connected: false,
  start: () => {
    if (!websocketGame.connected) {
      log('websocketGame not connected')
      return
    }

    websocketGame.socket.send('start')
  },
}

websocketGame.socket.addEventListener('open', (event) => {
  websocketGame.connected = true
})

websocketGame.socket.addEventListener('message', (event) => {
  log('message from game: ' + event.data)
})
