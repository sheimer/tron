import './ws/ping.js'
import { GamePage, game } from './page/Game.js'
import { LobbyPage } from './page/Lobby.js'
import { Settings } from './page/Settings.js'
import './dropdown.js'

class Page {
  constructor(handler = []) {
    this.state = null
    this.stateHandler = handler

    const settings = new Settings()

    const lobbyPage = new LobbyPage({
      connectGame: (gameId, name) => {
        game.key = gameId
        game.name = name
        game.addConnectedGame(gameId)
        page.setState('playersconfig')
      },
    })

    const gamePage = new GamePage({
      toGameMode: () => {
        this.setState('game')
      },
    })

    this.addHandler((state) => {
      settings.pageHandler(state)
      lobbyPage.pageHandler(state)
      gamePage.pageHandler(state)
    })

    this.setState('lobby')
  }

  setState(state) {
    const changed = this.state !== state
    this.state = state
    if (changed) {
      this.stateHandler.forEach((handler) => handler(state))
    }
  }

  addHandler(handler) {
    this.stateHandler.push(handler)
  }
}

const page = new Page()
