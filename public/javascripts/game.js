import { log } from './include.js'
import { PlayerFE } from './PlayerFE.js'
import { Renderer } from './Renderer.js'
import { websocketGame } from './websocket.js'

export const game = {}
const properties = {
  fps: 25,
  size: {
    x: 320,
    y: 200,
  },
  blocksize: 2,
  bgColor: 'rgb(255,255,255)',
  bordercolor: 'rgb(0,0,0)',
  playercolors: [
    'rgb(0,0,0)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
  ],
}

game.timer = {
  interval: Math.round(1000 / properties.fps),
}

game.init = function () {
  const players = [
    {
      name: 'hidden',
      color: properties.playercolors[0],
      left: 75, // k
      right: 76, // l
      pos: { x: 40, y: 100 },
      move: 1,
    },
    {
      name: 'sheimer',
      color: properties.playercolors[1],
      left: 65, // a
      right: 83, // s
      pos: { x: 279, y: 100 },
      move: 3,
    },
  ]

  game.rendererWS = new Renderer({ ...properties, id: 'arenaWS' })

  const onchangedir = ({ id, dir }) => {
    websocketGame.changeDir({ id, dir })
  }

  game.players = [
    new PlayerFE({ ...players[0], id: 0, onchangedir }),
    new PlayerFE({ ...players[1], id: 1, onchangedir }),
  ]

  websocketGame.connect({
    size: properties.size,
    players,
    interval: game.timer.interval,
    onmessage: (msg) => {
      if (msg.action === 'draw') {
        this.rendererWS.draw(msg.payload)
      } else if (msg.action === 'finish') {
        msg.payload.forEach((msg) => log(msg))
      }
    },
  })
}

game.start = function () {
  document.getElementById('log').innerHTML = ''

  websocketGame.start()
}
