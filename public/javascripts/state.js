/**
 * Reactive Client State Store
 */
class State {
  constructor() {
    this.screen = 'lobby' // 'lobby' | 'config' | 'game'
    this.currentGame = {
      key: null,
      name: null,
    }
    this.connectedGames =
      JSON.parse(sessionStorage.getItem('connectedGames')) ?? {}

    this.gamesList = []
    this.matchState = 'initializing'
    this.players = []
    this.positions = {}
    this.scores = { gamecount: 0, players: [], messages: [] }

    this.listeners = new Map()
  }

  get(key) {
    return this[key]
  }

  set(key, value) {
    const prev = this[key]
    this[key] = value
    this.emit(key, value, prev)
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key).add(callback)
    return () => this.listeners.get(key).delete(callback)
  }

  emit(key, value, prev) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach((cb) => {
        try {
          cb(value, prev)
        } catch (err) {
          console.error(`Error in state listener for "${key}":`, err)
        }
      })
    }
  }

  setScreen(screen) {
    this.set('screen', screen)
  }

  setCurrentGame(key, name) {
    this.currentGame = { key, name }
    this.addConnectedGame(key)
    this.emit('currentGame', this.currentGame)
  }

  addConnectedGame(key) {
    if (!this.connectedGames[key]) {
      this.connectedGames[key] = { localPlayers: {} }
      this.saveConnectedGames()
    }
  }

  addLocalPlayer(playerId) {
    const key = this.currentGame.key
    if (key && this.connectedGames[key]) {
      this.connectedGames[key].localPlayers[playerId] = true
      this.saveConnectedGames()
      this.emit('localPlayers', this.connectedGames[key].localPlayers)
    }
  }

  isLocalPlayer(playerId) {
    const key = this.currentGame.key
    return !!(key && this.connectedGames[key]?.localPlayers?.[playerId])
  }

  removeConnectedGames(keys) {
    keys.forEach((key) => {
      delete this.connectedGames[key]
    })
    this.saveConnectedGames()
  }

  saveConnectedGames() {
    sessionStorage.setItem(
      'connectedGames',
      JSON.stringify(this.connectedGames),
    )
  }
}

export const state = new State()
