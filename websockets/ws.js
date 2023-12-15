const ws = require('ws')

const Game = require('../lib/game')

const wssEcho = new ws.WebSocketServer({
  noServer: true,
  perMessageDeflate: false,
})
wssEcho.on('connection', (ws) => {
  ws.on('message', (msg, binary) => {
    ws.send(msg, { binary })
  })
})

const wssGame = new ws.WebSocketServer({
  noServer: true,
  perMessageDeflate: false,
})
wssGame.on('connection', (ws) => {
  ws.on('message', (msg, binary) => {
    msg = msg.toString()
    if (msg === 'start') {
      const game = new Game(ws)
      game.run()
    }
  })
})

const addWebsockets = (server) => {
  server.on('upgrade', (req, socket, head) => {
    if (req.url.startsWith('/ws/echo')) {
      wssEcho.handleUpgrade(req, socket, head, (ws) => {
        wssEcho.emit('connection', ws, req)
      })
    } else if (req.url.startsWith('/ws/game')) {
      wssGame.handleUpgrade(req, socket, head, (ws) => {
        wssGame.emit('connection', ws, req)
      })
    } else {
      socket.destroy()
    }
  })
}

module.exports = addWebsockets
