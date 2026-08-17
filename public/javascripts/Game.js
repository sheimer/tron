import { PlayerFE } from './PlayerFE.js'
import { Renderer } from './Renderer.js'
import { wsGame } from './ws/game.js'
import { settings } from './settings.js'
import { getThemeColors, onThemeChange } from './theme.js'
import { PLAYER_COLOR_KEYS, GRID_SIZE, BLOCK_SIZE } from '/shared/constants.js'

export const defaultProperties = {
  fps: settings.speed,
  size: GRID_SIZE,
  blocksize: BLOCK_SIZE,
}

const buildColorConfig = () => {
  const colors = getThemeColors()
  return {
    bgColor: colors.bg,
    bordercolor: colors.fg,
    explosioncolor: colors.rose,
    playercolors: PLAYER_COLOR_KEYS.map((name) => ({
      name,
      value: colors[name],
    })),
    playerbw: Array(PLAYER_COLOR_KEYS.length)
      .fill('fg')
      .map((name) => ({
        name,
        value: colors.fg,
      })),
  }
}

defaultProperties.colors = buildColorConfig()

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
      bgColor: this.properties.colors.bgColor,
      bordercolor: this.properties.colors.bordercolor,
      explosioncolor: this.properties.colors.explosioncolor,
      playercolors: this.properties.colors[
        settings.coloredPlayers ? 'playercolors' : 'playerbw'
      ].map((color) => color.value),
      id: 'arena',
    })

    this.onThemeUpdate = this.onThemeUpdate.bind(this)
    this.onSpeedChange = this.onSpeedChange.bind(this)

    this.unsubscribeTheme = onThemeChange(this.onThemeUpdate)
    settings.addListener('coloredPlayers', this.onThemeUpdate)
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
    if (this.unsubscribeTheme) {
      this.unsubscribeTheme()
    }
    settings.removeListener('coloredPlayers', this.onThemeUpdate)
    settings.removeListener('speed', this.onSpeedChange)
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

  onThemeUpdate() {
    defaultProperties.colors = buildColorConfig()
    this.properties.colors = { ...defaultProperties.colors }

    const playerColors = this.properties.colors[
      settings.coloredPlayers ? 'playercolors' : 'playerbw'
    ].map((c) => c.value)

    this.renderer.setColors({
      bgColor: this.properties.colors.bgColor,
      bordercolor: this.properties.colors.bordercolor,
      explosioncolor: this.properties.colors.explosioncolor,
      playercolors: playerColors,
    })
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
