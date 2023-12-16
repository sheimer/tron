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
  socket: new WebSocket('ws://localhost:3000/ws/game'),
  connected: false,
  init: (args) => {
    if (!websocketGame.connected) {
      log('websocketGame not connected')
      console.log('go on here...init game on websocket only after connection established!')
      return
    }

    const msg = JSON.stringify({ action: 'init', payload: args })
    console.log(msg)
    websocketGame.socket.send(msg)
  },
  start: () => {
    if (!websocketGame.connected) {
      log('websocketGame not connected')
      return
    }

    websocketGame.socket.send(JSON.stringify({ action: 'start' }))
  },
}

websocketGame.socket.addEventListener('open', (event) => {
  websocketGame.connected = true
})

websocketGame.socket.addEventListener('message', (event) => {
  log('message from game: ' + event.data)
})
