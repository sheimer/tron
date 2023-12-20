import { Game } from './Game.js'
import { websocket } from './websocket.js'

const ping = document.getElementById('ping')
setInterval(() => {
  if (websocket.connected) {
    websocket.ping(ping)
  }
}, 1000)

const startBtn = document.getElementById('btn-start-game')

const addPlayersBeforeProperlyImplemented = (state) => {
  if (state === 'settingPlayers') {
    game.addPlayer({
      name: 'hidden',
      left: 75, // k
      right: 76, // l
    })
    game.addPlayer({
      name: 'sheimer',
      left: 65, // a
      right: 83, // s
    })
    game.setState('ready')
  }
}

const enableStartIfReady = (state) => {
  const disabled = !(state === 'ready' || state === 'finished')
  const setFocus = !disabled && startBtn.disabled
  startBtn.disabled = disabled
  if (setFocus) {
    startBtn.focus()
  }
}

const resetLog = (state) => {
  if (state === 'waitingForServer') {
    document.getElementById('log').innerHTML = ''
  }
}

const game = new Game({
  stateHandler: [
    addPlayersBeforeProperlyImplemented,
    enableStartIfReady,
    resetLog,
  ],
})

startBtn.onclick = () => {
  game.start()
  return false
}
