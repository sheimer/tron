import { Arena } from './Arena.js'
import { Player } from '../public/javascripts/shared/Player.js'

export const Game = class {
  constructor({ key, name, size, interval, isPublic, onChange }) {
    this.key = key
    this.name = name
    this.isPublic = isPublic
    this.onChange = onChange

    this.interval = interval
    this.timeout = null
    this.lastaction = null
    this.gameStarted = null
    this.running = false
    this.acceptingPlayers = true
    this.stats = {
      gamecount: 0,
      players: [],
    }

    this.arena = new Arena({
      size,
    })

    console.log(
      'players should be removed on connection loss? or other handling, so reconnect still possible',
    )
    console.log(
      'either accepting players false if game full with 6 players, or more then 6 allowed, and participants in next game depends on who wins or looses',
    )
  }

  connect({ ondraw, onfinish, onreset }) {
    this.arena.addHandler({
      ondraw,
      onfinish: (stats) => {
        this.running = false
        this.addStats(stats)
        onfinish(this.stats)
      },
      onreset,
    })
  }

  addPlayer(player) {
    this.arena.addPlayer(new Player({ ...player }))

    this.stats.players.push({
      id: player.id,
      kills: 0,
      killed: 0,
      escaped: 0,
      total: 0,
    })

    if (this.acceptingPlayers) {
      this.onChange()
    }
  }

  addStats(stats) {
    /*
    { kills: { '6b64ce1b': 'dbbaf28e' }, escaped: [], winner: '6b64ce1b' }
    {
      gamecount: 0,
      players: [
        { id: '6b64ce1b', kills: 0, killed: 0, escaped: 0, total: 0 },
        { id: 'dbbaf28e', kills: 0, killed: 0, escaped: 0, total: 0 }
      ]
    }
    kill:   score += PR
    escape: score += PR*3 (ON ESCAPE:: "time of dead" and "win" scores not counted)
    time of dead: score += DEATH_ORDER OF PLAYER
        on player death store amount of already dead players as bonus score, _then_ add one to number of dead players.
    win:    score += PR*2
    */
    this.stats.gamecount++
    console.log(stats)
    console.log(this.stats)
  }

  reset() {
    this.arena.reset()
  }

  start() {
    if (this.acceptingPlayers) {
      this.acceptingPlayers = false
      this.onChange()
    }

    if (this.timeout !== null) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    this.arena.reset({ finish: this.running })
    this.running = false
    this.lastaction = null
    this.gameStarted = null
    this.run()
  }

  run() {
    const current = new Date().getTime()
    if (this.gameStarted === null) {
      this.gameStarted = current
      this.running = true
    } else if (!this.running) {
      this.lastaction = null
      this.gameStarted = null
      return
    }

    const timediff =
      this.lastaction === null ? this.interval : current - this.lastaction

    if (timediff >= this.interval && this.running) {
      this.lastaction = current
      this.arena.run()
    }

    this.timeout = setTimeout(() => {
      if (this.running) {
        this.run()
      }
    }, 0)
  }

  changeDir({ id, dir }) {
    const player = this.arena.players.find((player) => player.id === id)
    if (player) {
      player.changeDir(dir)
    }
  }
}
