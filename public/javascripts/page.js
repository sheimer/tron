import './ws/ping.js'
import './ui/dropdown.js'
import { state } from './state.js'
import { settings } from './settings.js'
import { Game } from './Game.js'
import { SettingsView } from './ui/settingsView.js'
import { LobbyView } from './ui/lobbyView.js'
import { ConfigView } from './ui/configView.js'
import { GameView } from './ui/gameView.js'

class AppCoordinator {
  constructor() {
    this.gameInstance = null

    this.settingsView = new SettingsView()

    this.lobbyView = new LobbyView({
      onSelectGame: (gameId, name) => {
        state.setCurrentGame(gameId, name)
        this.initGameSession(gameId)
        this.setScreen('config')
      },
    })

    this.configView = new ConfigView({
      onAddPlayer: ({ name, left, right }) => {
        if (this.gameInstance) {
          const playerId = this.gameInstance.addPlayer({ name, left, right })
          state.addLocalPlayer(playerId)
        }
      },
      onStartGame: () => {
        if (this.gameInstance) {
          this.gameInstance.start()
        }
      },
    })

    this.gameView = new GameView({
      onStartGame: () => {
        if (this.gameInstance) {
          this.gameInstance.start()
        }
      },
    })

    // Listen to reactive state changes
    state.subscribe('screen', (screen) => {
      this.updateScreenViews(screen)
    })

    settings.addListener('coloredPlayers', () => {
      if (this.gameInstance) {
        this.configView.updatePlayersTable(this.gameInstance.players)
        this.gameView.updateScores(state.scores, this.gameInstance.players)
      }
    })

    this.setScreen('lobby')
  }

  setScreen(screen) {
    state.setScreen(screen)
  }

  updateScreenViews(screen) {
    if (screen === 'lobby') {
      if (this.gameInstance) {
        this.gameInstance.destroy()
        this.gameInstance = null
      }
      this.configView.hide()
      this.gameView.hide()
      this.lobbyView.show()
    } else if (screen === 'config') {
      this.lobbyView.hide()
      this.gameView.hide()
      this.configView.show(state.currentGame)
    } else if (screen === 'game') {
      this.lobbyView.hide()
      this.configView.hide()
      this.gameView.show()
    }
  }

  initGameSession(gameId) {
    if (this.gameInstance) {
      this.gameInstance.destroy()
    }

    const localPlayers = state.connectedGames[gameId]?.localPlayers || {}

    this.gameInstance = new Game({
      key: gameId,
      localPlayers,
      stateHandler: [
        (matchState) => {
          state.set('matchState', matchState)
          this.gameView.updateState(matchState)
        },
      ],
      onPlayersUpdate: (players) => {
        state.set('players', players)
        this.configView.updatePlayersTable(players)
      },
      onPlayersPositions: ({ players, positions }) => {
        state.set('positions', positions)
        this.gameView.updatePlayerPositions(players, positions)
        this.setScreen('game')
      },
      onConnected: (gameState) => {
        if (gameState.started) {
          this.setScreen('game')
        }
      },
      onScoresUpdate: (scores) => {
        state.set('scores', scores)
        this.gameView.updateScores(scores, this.gameInstance?.players || [])
      },
    })
  }
}

const app = new AppCoordinator()
export { app }
