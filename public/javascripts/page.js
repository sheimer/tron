import { wsPing } from './ws/ping.js'
import { GamePage } from './page/Game.js'
import { LobbyPage } from './page/Lobby.js'

const ping = document.getElementById('ping')
setInterval(() => {
  if (wsPing.connected) {
    wsPing.ping(ping)
  }
}, 1000)

class Page {
  constructor(handler = []) {
    this.state = null

    this.stateHandler = handler
  }

  setState(state) {
    this.state = state
    this.stateHandler.forEach((handler) => handler(state))
  }

  addHandler(handler) {
    this.stateHandler.push(handler)
  }
}

const page = new Page()

console.log('where will "game connected" be set?!?!')
const lobbyPage = new LobbyPage({
  onGameConnect: (gameId) => {
    console.log(gameId, '...has to be used by game to init server game')
    page.setState('playersconfig')
  },
})

page.addHandler((state) => {
  lobbyPage.pageHandler(state)
})

const gamePage = new GamePage()

page.addHandler((state) => {
  gamePage.pageHandler(state)
})

page.setState('lobby')

// after select/create game: show playersconfig
// if all players ready: start game rotation
