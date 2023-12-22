import { Game } from '../Game.js'

const startBtn = document.getElementById('btn-start-game')
const arena = document.getElementById('arena')
const playersconfig = document.getElementById('playersconfig')
const playernames = document.getElementById('playernames')
const scores = document.getElementById('scores')

export class GamePage {
  pageHandler(state) {
    if (state !== 'game') {
      startBtn.style.display = 'none'
      arena.style.display = 'none'
      playersconfig.style.display = 'none'
      playernames.style.display = 'none'
      scores.style.display = 'none'
    } else {
      startBtn.style.display = ''
      arena.style.display = ''
      if (state === 'playersconfig' || state === 'game') {
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
          if (state === 'running') {
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
      }
    }
  }
}
