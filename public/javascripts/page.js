import './ws/ping.js'
import { GamePage, game } from './page/Game.js'
import { LobbyPage } from './page/Lobby.js'
import { SettingsPage } from './page/Settings.js'
import { settings } from './settings.js'
import './dropdown.js'

class Page {
  constructor(handler = []) {
    this.state = null
    this.stateHandler = handler

    const settingsPage = new SettingsPage()

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
      settingsPage.pageHandler(state)
      lobbyPage.pageHandler(state)
      gamePage.pageHandler(state)
    })

    this.showGamestats = this.showGamestats.bind(this)
    this.showGamestats(settings.showGamestats)
    settings.addListener('showGamestats', this.showGamestats)

    this.showPalette = this.showPalette.bind(this)
    this.showPalette(settings.showPalette)
    settings.addListener('showPalette', this.showPalette)

    this.setState('lobby')
  }

  destroy() {
    settings.removeListener('showGamestats', this.showGamestats)
    settings.removeListener('showPalette', this.showPalette)
  }

  showGamestats(show) {
    document.getElementById('gamestats').style.display = show ? 'block' : 'none'
  }

  showPalette(show) {
    document.getElementById('palette').style.display = show ? 'block' : 'none'
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
