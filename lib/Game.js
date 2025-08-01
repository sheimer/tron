import WebSocket from 'ws'

import { Arena } from './Arena.js'
import { Player } from '../public/javascripts/shared/Player.js'

export const Game = class {
  constructor({ key, name, size, interval, isPublic, onChange, onDestroy }) {
    this.createdAt = Date.now()
    this.key = key
    this.name = name
    this.isPublic = isPublic
    this.onChange = onChange
    this.onDestroy = onDestroy

    this.interval = interval
    this.timeout = null
    this.lastaction = null
    this.gameStarted = null
    this.running = false
    this.acceptingPlayers = true
    this.stats = {
      gamecount: 0,
      players: [],
      messages: [],
    }

    this.arena = new Arena({
      size,
    })

    this.clients = []
    this.allDisconnected = null
    this.checkConnectionStatus()
  }

  destroy() {
    if (typeof this.arena.destroy === 'function') {
      this.arena.destroy()
    }
    this.arena = null
    this.onChange = null
    this.clients = []

    this.onDestroy()
    this.onDestroy = null
  }

  checkConnectionStatus() {
    if (this.clients.length || Date.now() - this.createdAt > 60 * 1000) {
      const connectionExists = this.clients.some(
        (client) => client?.readyState === WebSocket.OPEN,
      )
      if (connectionExists) {
        this.allDisconnected = null
      } else {
        if (this.allDisconnected === null) {
          this.allDisconnected = Date.now()
        }
        if (Date.now() - this.allDisconnected > 5 * 60 * 1000) {
          this.destroy()
          return
        }
      }
    }
    setTimeout(() => {
      this.checkConnectionStatus()
    }, 60 * 1000)
  }

  connect({ client, ondraw, onfinish, onreset }) {
    this.clients.push(client)
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
      name: player.name,
      kills: 0,
      killed: 0,
      escaped: 0,
      lastScore: 0,
      total: 0,
    })

    if (this.acceptingPlayers) {
      if (this.stats.players.length >= 6) {
        this.acceptingPlayers = false
      }
      this.onChange()
    }
  }

  addStats(stats) {
    const playerscount = this.stats.players.length
    const playersById = this.stats.players.reduce((players, player) => {
      players[player.id] = player
      return players
    }, {})

    this.stats.gamecount++
    this.stats.messages = []
    for (let i = 0; i < playerscount; i++) {
      this.stats.players[i].lastScore = 0
    }

    Object.entries(stats.kills).forEach(([killerId, killedId]) => {
      const killer = playersById[killerId]
      const killed = playersById[killedId]
      killer.kills++
      killed.killed++
      killer.lastScore += playerscount
      this.stats.messages.push(`${killer.name} kills ${killed.name}`)
    })

    if (stats.escaped.length) {
      stats.escaped.forEach((id) => {
        const escapee = playersById[id]
        escapee.escaped++
        escapee.lastScore += playerscount * 3
        this.stats.messages.push(`${escapee.name} escaped!!!`)
      })
    } else {
      Object.entries(stats.deadOnDeath).forEach(([id, deadcount]) => {
        const player = playersById[id]
        player.lastScore += deadcount
      })
      if (stats.winner !== null) {
        const player = playersById[stats.winner]
        player.lastScore += playerscount * 2
        this.stats.messages.push(`${player.name} wins game!`)
      } else {
        this.stats.messages.push('All players crashed')
      }
    }
    this.stats.players.forEach((player) => {
      player.total += player.lastScore
    })
  }

  reset() {
    this.arena.reset({ finish: this.running })
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
