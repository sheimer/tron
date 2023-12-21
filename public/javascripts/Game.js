import { log, fisherYatesShuffle } from './include.js'
import { PlayerFE } from './PlayerFE.js'
import { Renderer } from './Renderer.js'
import { websocketGame } from './websocket.js'

const _properties = {
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
  startPositions: [
    { x: 50, y: 50 },
    { x: 270, y: 50 },
    { x: 50, y: 100 },
    { x: 270, y: 100 },
    { x: 50, y: 150 },
    { x: 270, y: 150 },
  ],
  availablePostions: [
    [2, 3],
    [1, 2, 5],
    [0, 1, 4, 5],
    [0, 1, 2, 4, 5],
    [0, 1, 2, 3, 4, 5],
  ],
}

export class Game {
  constructor({ properties = {}, stateHandler = [] }) {
    this.states = [
      'initializing', // running automatically on page load
      'connecting', // running automatically on initializing, maybe later on disconnect as well
      'settingPlayers', // after connected
      'ready', // game ready to start. after player settings
      // game start requestable if "ready" or "scores"
      'waitingForServer', // game start requested, waiting for server
      'serverReady', // server ready, start game
      'running', // game running
      'scores', // game finished, showing scores
      'finished', // 1 second after scores, still showing scores, but ready to request new start
    ]

    this.stateHandler = [
      ...stateHandler,
      (state) => {
        if (state === 'connected') {
          this.setState('settingPlayers')
        } else if (state === 'serverReady') {
          setTimeout(() => {
            websocketGame.start()
            this.setState('running')
          }, 1000)
        } else if (state === 'scores') {
          setTimeout(() => {
            this.setState('finished')
          }, 1000)
        }
      },
    ]

    this.setState('initializing')

    this.properties = { ...properties, ..._properties }

    this.timer = {
      interval: Math.round(1000 / this.properties.fps),
    }

    this.renderer = new Renderer({ ...this.properties, id: 'arena' })
    this.players = []

    websocketGame.connect({
      size: this.properties.size,
      interval: this.timer.interval,
      onmessage: (msg) => {
        if (msg.action === 'setState') {
          this.setState(msg.payload)
        } else if (msg.action === 'draw') {
          this.renderer.draw(msg.payload)
        } else if (msg.action === 'finish') {
          msg.payload.forEach((msg) => log(msg))
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

  addPlayer(player) {
    const id = this.players.length
    this.players.push(
      new PlayerFE({
        ...player,
        id,
        color: this.properties.playercolors[id],
        onchangedir: websocketGame.changeDir,
      }),
    )
  }

  start() {
    const randomPositions = fisherYatesShuffle([
      ...this.properties.availablePostions[this.players.length - 2],
    ])

    this.players.forEach((player, i) => {
      const posId = randomPositions[i]
      player.pos = this.properties.startPositions[posId]
      player.move = posId % 2 === 0 ? 1 : 3
    })

    console.log('positioning has to go to server!!!')

    websocketGame.setPlayers(this.players)
    this.setState('waitingForServer')
  }
}
