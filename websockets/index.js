import { wssEcho } from './echo.js'
import { wssGame } from './game.js'
import { wssLobby } from './lobby.js'

export const addWebsockets = (server) => {
  server.on('upgrade', (req, socket, head) => {
    if (req.url.startsWith('/ws/echo')) {
      wssEcho.handleUpgrade(req, socket, head, (ws) => {
        wssEcho.emit('connection', ws, req)
      })
    } else if (req.url.startsWith('/ws/game')) {
      const gameId = req.url.replace(/^\/ws\/game\//, '')
      wssGame.handleUpgrade(req, socket, head, (ws) => {
        ws.gameId = gameId
        wssGame.emit('connection', ws, req)
      })
    } else if (req.url.startsWith('/ws/lobby')) {
      wssLobby.handleUpgrade(req, socket, head, (ws) => {
        wssLobby.emit('connection', ws, req)
      })
    } else {
      socket.destroy()
    }
  })
}
