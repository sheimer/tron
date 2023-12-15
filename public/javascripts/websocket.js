import { log } from './include.js'

export const websocket = {
  socket: new WebSocket('ws://localhost:3000/ws/echo'),
  connected: false,
  measureTime: false,
  ping: () => {
    if (!websocket.connected) {
      log('websocket not connected')
      return
    }

    websocket.measureTime = true
    console.time()
    websocket.socket.send('timetest')
  },
}

websocket.socket.addEventListener('open', (event) => {
  websocket.connected = true
  websocket.socket.send('hello server')
})

websocket.socket.addEventListener('message', (event) => {
  if (websocket.measureTime) {
    websocket.measureTime = false
    console.timeEnd()
  }
  log('message from server: ' + event.data)
})
