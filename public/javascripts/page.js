import { game } from './game.js'
import { websocket, websocketGame } from './websocket.js'

document.getElementById('btn-start-game').onclick = () => {
  game.start()
  return false
}

document.getElementById('btn-echo-ws').onclick = () => {
  return false
}

document.getElementById('btn-start-game-ws').onclick = () => {
  websocketGame.start()
  return false
}

const pingContainer = document.createElement('div')
pingContainer.style.position = 'absolute'
pingContainer.style.top = '50px'
pingContainer.style.right = '50px'
pingContainer.style.color = '#ccc'

const ping = document.createElement('h1')
pingContainer.appendChild(ping)

document.body.appendChild(pingContainer)

setInterval(() => {
  if (websocket.connected) {
    websocket.ping(ping)
  }
}, 1000)

game.init()
