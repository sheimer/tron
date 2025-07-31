import { randomBytes } from 'crypto'

import { Game } from '../lib/Game.js'

class GameServer {
  constructor() {
    this.games = []
    this.changeHandler = null
  }

  createGame({ name, size, interval, isPublic }) {
    const key = randomBytes(4).toString('hex')
    this.games.push(
      new Game({
        key,
        name,
        size,
        interval,
        isPublic,
        onChange: () => {
          if (this.changeHandler !== null) {
            this.changeHandler()
          }
        },
        onDestroy: () => {
          this.destroyGame(key)
          if (this.changeHandler !== null) {
            this.changeHandler()
          }
        },
      }),
    )

    return key
  }

  destroyGame(key) {
    console.log('no connected clients anymore - destroy game key', key)
    const index = this.games.findIndex((game) => game.key === key)
    this.games.splice(index, 1)
  }

  getGameList() {
    return this.games
      .filter((game) => game.isPublic)
      .map((game) => ({
        key: game.key,
        name: game.name,
        numPlayers: game.arena.players.length,
        acceptingPlayers: game.acceptingPlayers,
      }))
  }

  getGame(key) {
    return this.games.find((game) => game.key === key)
  }

  getGameInfo(key) {
    const game = this.getGame(key)
    return {
      key: game.key,
      name: game.name,
      players: game.arena.players.map((player) => player),
      started: game.gameStarted > 0,
      running: game.running,
      scores: game.stats,
    }
  }

  setChangeHandler(handler) {
    this.changeHandler = handler
  }
}

const gameServer = new GameServer()

export { gameServer }
