import { game } from './game.js'
import { websocket, websocketGame } from './websocket.js'

document.getElementById('btn-start-game').onclick = () => {
  game.start()
  return false
}

document.getElementById('btn-echo-ws').onclick = () => {
  websocket.ping()
  return false
}

document.getElementById('btn-start-game-ws').onclick = () => {
  websocketGame.start()
  return false
}

game.init()
