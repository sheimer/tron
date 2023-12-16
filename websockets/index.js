import { wssEcho } from './echo.js'
import { wssGame } from './game.js'

export const addWebsockets = (server) => {
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
