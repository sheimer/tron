import { log } from '../include.js'

let pingDiv = null

const maxConnectRetries = 20
const reconnectInterval = 1000

const { protocol, hostname, port } = window.location

export const wsPing = {
  socket: null,
  connectionRetries: 0,

  connect: () => {
    const socket = new WebSocket(
      `${protocol === 'https' ? 'wss' : 'ws'}://${hostname}${
        port.length ? ':' + port : ''
      }/ws/echo`,
    )
    socket.binaryType = 'blob'

    socket.addEventListener('open', (event) => {
      wsPing.connectionRetries = 0
    })

    socket.addEventListener('close', (event) => {
      if (wsPing.connectionRetries < maxConnectRetries) {
        setTimeout(() => {
          wsPing.connect()
        }, reconnectInterval)
        wsPing.connectionRetries++
      }
    })

    socket.addEventListener('message', (event) => {
      if (pingDiv !== null) {
        pingDiv.innerHTML = `${new Date().getTime() - event.data}ms ping`
      } else {
        log(`ping: ${new Date().getTime() - event.data}ms`)
      }
    })

    wsPing.socket = socket
  },

  ping: (div) => {
    if (div) {
      pingDiv = div
    }
    if (wsPing?.socket?.readyState !== 1) {
      if (pingDiv) {
        pingDiv.innerHTML = '-'
      } else {
        log('wsPing not connected')
      }
      return
    }

    wsPing.socket.send(new Date().getTime())
  },
}

wsPing.connect()
