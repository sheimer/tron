import { game } from './game.js'
import { websocket } from './websocket.js'

document.getElementById('btn-start-game').onclick = () => {
  game.start()
  return false
}

const ping = document.getElementById('ping')
setInterval(() => {
  if (websocket.connected) {
    websocket.ping(ping)
  }
}, 1000)

game.init()
