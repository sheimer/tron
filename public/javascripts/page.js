import { game } from './game.js'
import { websocket } from './websocket.js'

document.getElementById('btn-start-game').onclick = () => {
  game.start()
  return false
}

document.getElementById('btn-test-ws').onclick = () => {
  websocket.ping()
  return false
}

game.init()
