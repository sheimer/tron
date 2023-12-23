import { wsPing } from './ws/ping.js'
import { GamePage, game } from './page/Game.js'
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

const lobbyPage = new LobbyPage({
  connectGame: (gameId) => {
    game.key = gameId
    page.setState('playersconfig')
  },
})

page.addHandler((state) => {
  lobbyPage.pageHandler(state)
})

const gamePage = new GamePage({
  onAllPlayersSet: () => {
    page.setState('game')
  },
})

page.addHandler((state) => {
  gamePage.pageHandler(state)
})

page.setState('lobby')
