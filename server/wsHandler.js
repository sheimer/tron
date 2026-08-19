import WebSocket, { WebSocketServer } from 'ws'
import { gameServer } from './GameServer.js'
import { MSG_TYPE } from '../shared/protocol.js'
import { GRID_SIZE } from '../shared/constants.js'

const sanitizeString = (str, maxLength = 32) =>
  typeof str === 'string' ? str.trim().slice(0, maxLength) : ''

const sanitizeInterval = (interval) =>
  Math.max(10, Math.min(500, Math.round(Number(interval)) || 25))

const sanitizeDir = (dir) => (dir === 'left' || dir === 'right' ? dir : null)

export const setupWebSocketServer = (server) => {
  const wss = new WebSocketServer({
    noServer: true,
    perMessageDeflate: false,
  })

  server.on('upgrade', (req, socket, head) => {
    if (req.url.startsWith('/ws')) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req)
      })
    } else {
      socket.destroy()
    }
  })

  const broadcastToRoom = (gameKey, message) => {
    const data = typeof message === 'string' ? message : JSON.stringify(message)
    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        client.gameKey === gameKey
      ) {
        client.send(data)
      }
    })
  }

  const broadcastLobbyList = () => {
    const message = JSON.stringify({
      type: MSG_TYPE.LOBBY_LIST,
      payload: gameServer.getGameList(),
    })
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }

  gameServer.setChangeHandler(() => {
    broadcastLobbyList()
  })

  const pendingStarts = new Map()

  wss.on('connection', (ws) => {
    ws.gameKey = null

    // Send initial lobby list
    ws.send(
      JSON.stringify({
        type: MSG_TYPE.LOBBY_LIST,
        payload: gameServer.getGameList(),
      }),
    )

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString())
        const type = msg.type || msg.action
        const payload = msg.payload

        switch (type) {
          case MSG_TYPE.PING:
          case 'ping': {
            ws.send(
              JSON.stringify({
                type: MSG_TYPE.PONG,
                t: msg.t ?? payload ?? Date.now(),
                serverT: Date.now(),
              }),
            )
            break
          }

          case MSG_TYPE.LOBBY_LIST:
          case 'list': {
            ws.send(
              JSON.stringify({
                type: MSG_TYPE.LOBBY_LIST,
                payload: gameServer.getGameList(),
              }),
            )
            break
          }

          case MSG_TYPE.CREATE_GAME:
          case 'create': {
            const name = sanitizeString(payload?.name, 32) || 'Tron Game'
            const interval = sanitizeInterval(payload?.interval)
            const isPublic = Boolean(payload?.isPublic ?? true)

            const key = gameServer.createGame({
              name,
              size: GRID_SIZE,
              interval,
              isPublic,
            })
            ws.send(
              JSON.stringify({
                type: MSG_TYPE.GAME_CREATED,
                payload: key,
              }),
            )
            broadcastLobbyList()
            break
          }

          case MSG_TYPE.JOIN_GAME:
          case 'join': {
            const gameKey = sanitizeString(payload?.key || payload, 16)
            const game = gameServer.getGame(gameKey)
            if (!game) {
              ws.send(
                JSON.stringify({
                  type: MSG_TYPE.ERROR,
                  payload: `Game ${gameKey} not found`,
                }),
              )
              return
            }

            ws.gameKey = gameKey
            game.connect({
              client: ws,
              ondraw: (changes) => {
                broadcastToRoom(gameKey, {
                  type: MSG_TYPE.GAME_DRAW,
                  payload: changes,
                })
              },
              onfinish: (stats) => {
                broadcastToRoom(gameKey, {
                  type: MSG_TYPE.GAME_FINISH,
                  payload: stats,
                })
              },
              onreset: (positions) => {
                broadcastToRoom(gameKey, {
                  type: MSG_TYPE.GAME_RESET,
                  payload: positions,
                })
              },
            })

            ws.send(
              JSON.stringify({
                type: MSG_TYPE.GAME_INFO,
                payload: gameServer.getGameInfo(gameKey),
              }),
            )
            break
          }

          case MSG_TYPE.ADD_PLAYER:
          case 'addPlayer': {
            if (!ws.gameKey) return
            const game = gameServer.getGame(ws.gameKey)
            if (game && payload) {
              const name = sanitizeString(payload.name, 24) || 'Player'
              const id = sanitizeString(payload.id, 16)
              const color = sanitizeString(payload.color, 16) || 'fg'
              const left = payload.left
              const right = payload.right

              game.addPlayer({ id, name, color, left, right })
              broadcastToRoom(ws.gameKey, {
                type: MSG_TYPE.GAME_INFO,
                payload: gameServer.getGameInfo(ws.gameKey),
              })
            }
            break
          }

          case MSG_TYPE.START_GAME:
          case 'start': {
            if (!ws.gameKey) return
            const gameKey = ws.gameKey
            const game = gameServer.getGame(gameKey)
            if (!game) return

            // Clear any prior pending start in this room
            const prevPending = pendingStarts.get(gameKey)
            if (prevPending) {
              clearTimeout(prevPending.fallbackTimer)
              clearTimeout(prevPending.startTimer)
              pendingStarts.delete(gameKey)
            }

            game.reset()

            const roomClients = Array.from(wss.clients).filter(
              (c) => c.readyState === WebSocket.OPEN && c.gameKey === gameKey,
            )

            const pending = {
              readyClients: new Set(),
              expectedCount: roomClients.length,
              countdownStarted: false,
              fallbackTimer: null,
              startTimer: null,
            }
            pendingStarts.set(gameKey, pending)

            const launchCountdown = () => {
              if (pending.countdownStarted) return
              pending.countdownStarted = true
              if (pending.fallbackTimer) {
                clearTimeout(pending.fallbackTimer)
                pending.fallbackTimer = null
              }

              broadcastToRoom(gameKey, {
                type: MSG_TYPE.GAME_STATE,
                payload: 'running',
              })

              pending.startTimer = setTimeout(() => {
                const g = gameServer.getGame(gameKey)
                if (g) {
                  g.start()
                }
                pendingStarts.delete(gameKey)
              }, 1000)
            }

            pending.launchCountdown = launchCountdown
            pending.fallbackTimer = setTimeout(launchCountdown, 2000)

            if (pending.expectedCount === 0) {
              launchCountdown()
            }
            break
          }

          case MSG_TYPE.ARENA_READY:
          case 'ARENA_READY': {
            if (!ws.gameKey) return
            const pending = pendingStarts.get(ws.gameKey)
            if (pending && !pending.countdownStarted) {
              pending.readyClients.add(ws)
              if (pending.readyClients.size >= pending.expectedCount) {
                pending.launchCountdown()
              }
            }
            break
          }

          case MSG_TYPE.SET_INTERVAL:
          case 'setInterval': {
            if (!ws.gameKey) return
            const game = gameServer.getGame(ws.gameKey)
            if (game) {
              game.setInterval(sanitizeInterval(payload))
            }
            break
          }

          case MSG_TYPE.CHANGE_DIR:
          case 'changeDir': {
            if (!ws.gameKey) return
            const game = gameServer.getGame(ws.gameKey)
            if (game && payload) {
              const dir = sanitizeDir(payload.dir)
              const id = sanitizeString(payload.id, 16)
              if (dir && id) {
                game.changeDir({ id, dir })
              }
            }
            break
          }

          default:
            ws.send(
              JSON.stringify({
                type: MSG_TYPE.ERROR,
                payload: `Unknown message type: ${type}`,
              }),
            )
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err)
      }
    })

    ws.on('close', () => {
      ws.gameKey = null
    })
  })
}
