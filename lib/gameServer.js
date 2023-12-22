import { randomBytes } from 'crypto'

import { Game } from '../lib/Game.js'

class GameServer {
  constructor() {
    this.games = []
  }

  createGame({ size, interval, isPublic }) {
    const key = randomBytes(4).toString('hex')
    this.games.push(
      new Game({
        key,
        size,
        interval,
        isPublic,
      }),
    )

    return key
  }

  getOpenGames() {
    return this.games.filter((game) => game.isPublic)
  }

  getGame(key) {
    return this.games.find((game) => game.key === key)
  }
}

export const gameServer = new GameServer()
