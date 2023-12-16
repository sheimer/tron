import { WebSocketServer } from 'ws'

export const wssEcho = new WebSocketServer({
  noServer: true,
  perMessageDeflate: false,
})

wssEcho.on('connection', (ws) => {
  ws.on('message', (msg, binary) => {
    ws.send(msg, { binary })
  })
})
