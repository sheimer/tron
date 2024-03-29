import { PlayerFE } from './PlayerFE.js'
import { Renderer } from './Renderer.js'
import { wsGame } from './ws/game.js'

export const defaultProperties = {
  fps: 50,
  size: {
    x: 320,
    y: 200,
  },
  blocksize: 2,
  bgColor: 'rgb(255,255,255)',
  bordercolor: 'rgb(0,0,0)',
  explosioncolor: 'rgb(122, 21, 21)',
  playercolors: [
    'rgb(0,0,0)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
  ],
}

export class Game {
  constructor({
    properties = {},
    key,
    stateHandler = [],
    onPlayersUpdate,
    onPlayersPositions,
    onScoresUpdate,
  }) {
    this.key = key
    this.states = [
      'initializing', // set in constructor
      'connecting', // set in constructor, maybe later on disconnect as well
      'settingPlayers', // after connected
      'ready', // game ready to start. after player settings
      // game start requestable if "ready" or "scores"
      'start', // game start requested
      'running', // game running
      'scores', // game finished, showing scores
      'finished', // 1 second after scores, still showing scores, but ready to request new start
    ]

    this.stateHandler = [
      ...stateHandler,
      (state) => {
        if (state === 'start') {
          wsGame.start()
        } else if (state === 'scores') {
          setTimeout(() => {
            this.setState('finished')
          }, 1000)
        }
      },
    ]
    this.onPlayersUpdate = onPlayersUpdate
    this.onPlayersPositions = onPlayersPositions
    this.onScoresUpdate = (scores) => {
      scores.players.forEach((player) => {
        player.isLocal = !!this.localPlayers[player.id]
      })
      onScoresUpdate(scores)
    }

    this.setState('initializing')

    this.properties = { ...properties, ...defaultProperties }

    this.renderer = new Renderer({ ...this.properties, id: 'arena' })
    this.players = []
    this.localPlayers = {}

    wsGame.connect({
      key: this.key,
      size: this.properties.size,
      interval: Math.round(1000 / this.properties.fps),
      onmessage: (msg) => {
        if (msg.action === 'serverState') {
          if (msg?.payload?.players) {
            this.onPlayersList(msg.payload.players)
          }
          if (this.state === 'connecting') {
            this.setState('settingPlayers')
          }
        } else if (msg.action === 'gameinfo') {
          this.onPlayersList(msg.payload.players)
        } else if (msg.action === 'setState') {
          this.setState(msg.payload)
        } else if (msg.action === 'reset') {
          this.onPlayersReset(msg.payload)
        } else if (msg.action === 'draw') {
          this.renderer.draw(msg.payload)
        } else if (msg.action === 'finish') {
          this.onScoresUpdate(msg.payload)
          this.setState('scores')
        }
      },
    })
    this.setState('connecting')
  }

  addStateHandler(handler) {
    if (!this.stateHandler.some((_hdl) => _hdl === handler)) {
      this.stateHandler.push(handler)
    }
  }

  rmvStateHandler(handler) {
    this.stateHandler = this.stateHandler.filter((_hdl) => _hdl !== handler)
  }

  setState(state) {
    // in timeout to prevent ordering problems, if a state handler sets state again
    setTimeout(() => {
      console.log('new game state: ', state)
      this.state = state
      this.stateHandler.forEach((handler) => {
        handler(state)
      })
    }, 0)
  }

  onPlayersList(players) {
    this.players.forEach((player) => {
      player.destroy()
    })
    this.players = []
    players.forEach((player) => {
      const newPlayer = { ...player }
      if (this.localPlayers[player.id]) {
        newPlayer.onchangedir = wsGame.changeDir
        newPlayer.isLocal = true
      } else {
        newPlayer.onchangedir = null
        newPlayer.left = null
        newPlayer.right = null
        newPlayer.isLocal = false
      }
      this.players.push(new PlayerFE(newPlayer))
    })
    this.onPlayersUpdate(this.players)
  }

  onPlayersReset(positions) {
    this.onPlayersPositions({ players: this.players, positions })
  }

  addPlayer(player) {
    player.id = Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map((num) => num.toString(16).padStart(2, '0'))
      .join('')
    this.localPlayers[player.id] = true
    player.color = this.properties.playercolors[0]
    wsGame.addPlayer(player)
  }

  start() {
    this.setState('start')
  }
}
