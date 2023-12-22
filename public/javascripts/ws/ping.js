import { log } from '../include.js'

let pingDiv = null

const { protocol, hostname, port } = window.location

export const wsPing = {
  socket: new WebSocket(
    `${protocol === 'https' ? 'wss' : 'ws'}://${hostname}${
      port.length ? ':' + port : ''
    }/ws/echo`,
  ),
  connected: false,
  ping: (div) => {
    if (div) {
      pingDiv = div
    }
    if (!wsPing.connected) {
      log('wsPing not connected')
      return
    }

    wsPing.socket.send(new Date().getTime())
  },
}

wsPing.socket.binaryType = 'blob'

wsPing.socket.addEventListener('open', (event) => {
  wsPing.connected = true
})

wsPing.socket.addEventListener('message', (event) => {
  if (pingDiv !== null) {
    pingDiv.innerHTML = `${new Date().getTime() - event.data}ms ping`
  } else {
    log(`ping: ${new Date().getTime() - event.data}ms`)
  }
})
