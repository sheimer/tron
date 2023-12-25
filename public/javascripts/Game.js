import { log } from './include.js'
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
  constructor({ properties = {}, key, stateHandler = [], onPlayersUpdate }) {
    this.key = key
    this.states = [
      'initializing', // set in constructor
      'connecting', // set in constructor, maybe later on disconnect as well
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
        if (state === 'serverReady') {
          setTimeout(() => {
            wsGame.start()
          }, 1000)
        } else if (state === 'scores') {
          setTimeout(() => {
            this.setState('finished')
          }, 1000)
        }
      },
    ]
    this.onPlayersUpdate = onPlayersUpdate

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
          console.log(msg)
          if (msg?.payload?.players) {
            this.onPlayersList(msg.payload.players)
          }
          if (this.state === 'connecting') {
            this.setState('settingPlayers')
          }
        } else if (msg.action === 'gameinfo') {
          console.log(
            'gameinfo, onPlayersList should update playerstable and add local FEPlayer: ',
            msg.payload,
          )
          this.onPlayersList(msg.payload.players)
        } else if (msg.action === 'setState') {
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

  onPlayersList(players) {
    this.onPlayersUpdate(players)
    this.players.forEach((player) => {
      player.destroy()
    })
    this.players = []
    players.forEach((player) => {
      const newPlayer = { ...player }
      if (this.localPlayers[player.id]) {
        newPlayer.onchangedir = wsGame.changeDir
      } else {
        newPlayer.onchangedir = null
        newPlayer.left = null
        newPlayer.right = null
      }
      this.players.push(new PlayerFE(newPlayer))
    })
  }

  addPlayer(player) {
    player.id = Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map((num) => num.toString(16).padStart(2, '0'))
      .join('')
    console.log(player)
    player.color = this.properties.playercolors[0]
    wsGame.addPlayer(player)
  }

  start() {
    this.setState('waitingForServer')
  }
}
