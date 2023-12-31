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
      }),
    )

    return key
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
    const game = this.games.find((game) => game.key === key)
    return {
      key: game.key,
      name: game.name,
      players: game.arena.players.map((player) => player),
    }
  }

  setChangeHandler(handler) {
    this.changeHandler = handler
  }
}

const gameServer = new GameServer()

export { gameServer }
