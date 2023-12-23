import { Game } from '../Game.js'

const pageElements = {
  playersconfig: {
    playersconfig: document.getElementById('playersconfig'),
    footerPlayersconfig: document.getElementById('footer-playersconfig'),
  },
  game: {
    startBtn: document.getElementById('btn-start-game'),
    arena: document.getElementById('arena'),
    playernames: document.getElementById('playernames'),
    scores: document.getElementById('scores'),
    footerGame: document.getElementById('footer-game'),
  },
}

export const game = {
  key: null,
  instance: null,
}

const enableStartIfReady = (state) => {
  const disabled = !(state === 'ready' || state === 'finished')
  const setFocus = !disabled && pageElements.game.startBtn.disabled
  pageElements.game.startBtn.disabled = disabled
  if (setFocus) {
    pageElements.game.startBtn.focus()
  }
}

const resetLog = (state) => {
  if (state === 'waitingForServer') {
    document.getElementById('log').innerHTML = ''
  }
}

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

export class GamePage {
  constructor({ onAllPlayersSet }) {
    this.onAllPlayersSet = onAllPlayersSet
  }

  pageHandler(pageState) {
    console.log('page game receiving page state ', pageState)
    if (pageState === 'playersconfig') {
      Object.values(pageElements.game).forEach((element) => {
        element.style.display = 'none'
      })

      game.instance = new Game({
        key: game.key,
        stateHandler: [
          addPlayersBeforeProperlyImplemented,
          enableStartIfReady,
          resetLog,
        ],
      })

      this.onAllPlayersSet()
    } else if (pageState === 'game') {
      Object.values(pageElements.playersconfig).forEach((element) => {
        element.style.display = 'none'
      })
      pageElements.game.footerGame.style.display = 'flex'
      pageElements.game.startBtn.style.display = 'block'
      pageElements.game.arena.style.display = 'block'

      game.instance.addStateHandler(enableStartIfReady)
      game.instance.addStateHandler(resetLog)

      pageElements.game.startBtn.onclick = () => {
        game.instance.start()
        return false
      }
    } else {
      Object.values(pageElements.game).forEach((element) => {
        element.style.display = 'none'
      })
      Object.values(pageElements.playersconfig).forEach((element) => {
        element.style.display = 'none'
      })
    }
  }
}
