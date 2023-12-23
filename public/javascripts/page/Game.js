import { Game } from '../Game.js'

const startBtn = document.getElementById('btn-start-game')
const arena = document.getElementById('arena')
const playersconfig = document.getElementById('playersconfig')
const playernames = document.getElementById('playernames')
const scores = document.getElementById('scores')

export const game = {
  key: null,
  instance: null,
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

export class GamePage {
  constructor({ onAllPlayersSet }) {
    this.onAllPlayersSet = onAllPlayersSet
  }

  pageHandler(state) {
    if (state !== 'game' && state !== 'playersconfig') {
      startBtn.style.display = 'none'
      arena.style.display = 'none'
      playersconfig.style.display = 'none'
      playernames.style.display = 'none'
      scores.style.display = 'none'
    } else {
      startBtn.style.display = ''
      arena.style.display = ''
      console.log('page game receiving page state ', state)
      if (state === 'playersconfig') {
        const addPlayersBeforeProperlyImplemented = (state) => {
          if (state === 'settingPlayers') {
            game.instance.addPlayer({
              name: 'hidden',
              left: 75, // k
              right: 76, // l
            })
            game.instance.addPlayer({
              name: 'sheimer',
              left: 65, // a
              right: 83, // s
            })
            game.instance.setState('ready')
          }
        }

        game.instance = new Game({
          key: game.key,
          stateHandler: [
            addPlayersBeforeProperlyImplemented,
            enableStartIfReady,
            resetLog,
          ],
        })

        this.onAllPlayersSet()
      } else if (state === 'game') {
        game.instance.addStateHandler(enableStartIfReady)
        game.instance.addStateHandler(resetLog)

        startBtn.onclick = () => {
          game.instance.start()
          return false
        }
      }
    }
  }
}
