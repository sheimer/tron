import { PlayerFE } from './PlayerFE.js'
import { Renderer } from './Renderer.js'
import { wsGame } from './ws/game.js'
import { settings } from './settings.js'
import { cssColors } from './cssColors.js'

export const defaultProperties = {
  // fps: 50, // original speed i guess...
  fps: settings.speed,
  size: { x: 320, y: 200 },
  blocksize: 2,
}

const setColors = () => {
  defaultProperties.colors = {
    bgColor: cssColors.bg,
    bordercolor: cssColors.fg,
    explosioncolor: cssColors.rose,
    playercolors: ['water', 'wood', 'leaf', 'blossom', 'sky', 'rock'].map(
      (name) => ({
        name,
        value: cssColors[name],
      }),
    ),
    playerbw: Array(6)
      .fill('fg')
      .map((name) => ({
        name,
        value: cssColors[name],
      })),
  }
}

setColors()

export class Game {
  constructor({
    properties = {},
    key,
    localPlayers = {},
    stateHandler = [],
    onPlayersUpdate,
    onPlayersPositions,
    onConnected,
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
      'scoresWaiting', // game finished, showing scores, but no autofinished state (after reconnect while game still running)
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

    this.localPlayers = localPlayers
    this.players = []

    this.onPlayersUpdate = onPlayersUpdate
    this.onPlayersPositions = onPlayersPositions
    this.onConnected = onConnected
    this.onScoresUpdate = (scores) => {
      scores.players.forEach((player) => {
        player.isLocal = !!this.localPlayers[player.id]
      })
      onScoresUpdate(scores)
    }

    this.setState('initializing')

    this.properties = { ...defaultProperties, ...properties }

    this.renderer = new Renderer({
      blocksize: this.properties.blocksize,
      size: this.properties.size,
      ...this.properties.colors,
      playercolors: this.properties.colors[
        settings.coloredPlayers ? 'playercolors' : 'playerbw'
      ].map((color) => color.value),
      id: 'arena',
    })

    this.onSettingsChange = this.onSettingsChange.bind(this)
    this.onSpeedChange = this.onSpeedChange.bind(this)

    settings.addListener('theme', this.onSettingsChange)
    settings.addListener('coloredPlayers', this.onSettingsChange)
    settings.addListener('speed', this.onSpeedChange)

    wsGame.connect({
      key: this.key,
      size: this.properties.size,
      interval: Math.round(1000 / this.properties.fps),
      onmessage: (msg) => {
        if (msg.action === 'serverState') {
          const { players, running, started, scores } = msg?.payload ?? {}
          if (players) {
            this.onPlayersList(players)
          }
          if (this.state === 'connecting') {
            const gameState = { started, running }
            this.onConnected(gameState)
            if (started) {
              this.onScoresUpdate(scores)
              this.setState(running ? 'scoresWaiting' : 'scores')
            } else {
              this.setState('settingPlayers')
            }
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

  destroy() {
    settings.removeListener('theme', this.onSettingsChange)
    settings.removeListener('coloredPlayers', this.onSettingsChange)
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

  onSettingsChange() {
    setColors()
    this.properties.colors = { ...defaultProperties.colors }

    this.renderer.bgColor = this.properties.colors.bgColor
    this.renderer.bordercolor = this.properties.colors.bordercolor
    this.renderer.explosioncolor = this.properties.colors.explosioncolor
    this.renderer.playercolors = this.properties.colors[
      settings.coloredPlayers ? 'playercolors' : 'playerbw'
    ].map((color) => color.value)
    this.renderer.draw([])
  }

  onSpeedChange() {
    wsGame.setInterval(Math.round(1000 / settings.speed))
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
    player.color =
      player.color ?? this.properties.colors.playercolors[this.players.length]
    wsGame.addPlayer(player)
    return player.id
  }

  start() {
    this.setState('start')
  }
}
