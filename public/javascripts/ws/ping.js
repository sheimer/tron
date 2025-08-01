import { log } from '../include.js'

const maxConnectRetries = 20
const reconnectInterval = 1000

const { protocol, hostname, port } = window.location

const wsPing = {
  socket: null,
  connectionRetries: 0,
  windowClosing: false,
  pingDiv: document.getElementById('ping'),
  interval: null,

  connect: () => {
    const socket = new WebSocket(
      `${protocol.startsWith('https') ? 'wss' : 'ws'}://${hostname}${
        port.length ? ':' + port : ''
      }/ws/echo`,
    )
    socket.binaryType = 'blob'

    socket.addEventListener('open', (event) => {
      wsPing.connectionRetries = 0

      wsPing.ping()
      wsPing.interval = setInterval(() => {
        wsPing.ping()
      }, 1000)
    })

    socket.addEventListener('close', (event) => {
      clearInterval(wsPing.interval)
      if (
        !wsPing.windowClosing &&
        wsPing.connectionRetries < maxConnectRetries
      ) {
        setTimeout(() => {
          console.log('connect ping from close event')
          wsPing.connect()
        }, reconnectInterval)
        wsPing.connectionRetries++
      }
    })

    window.addEventListener('beforeunload', () => {
      wsPing.windowClosing = true
    })

    socket.addEventListener('message', (event) => {
      if (wsPing.pingDiv !== null) {
        wsPing.pingDiv.innerHTML = `${new Date().getTime() - event.data}ms ping`
      } else {
        log(`ping: ${new Date().getTime() - event.data}ms`)
      }
    })

    wsPing.socket = socket
  },

  ping: () => {
    if (wsPing.socket?.readyState !== 1) {
      if (wsPing.pingDiv) {
        wsPing.pingDiv.innerHTML = '-'
      } else {
        log('wsPing not connected')
      }
      return
    }

    wsPing.socket.send(new Date().getTime())
  },
}

wsPing.connect()
