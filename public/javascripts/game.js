import { log } from './include.js'
import { PlayerFE } from './PlayerFE.js'
import { Arena } from './shared/Arena.js'
import { Renderer } from './Renderer.js'
import { websocketGame } from './websocket.js'

export const game = {}
const properties = {
  fps: 20,
  size: {
    x: 320,
    y: 200,
  },
  blocksize: 1,
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
  started: null,
  lastrun: null,
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

  game.renderer = new Renderer({ ...properties, id: 'arena' })
  game.rendererWS = new Renderer({ ...properties, id: 'arenaWS' })
  game.arena = new Arena({
    size: properties.size,
    ondraw: (fields) => {
      game.renderer.draw(fields)
    },
    onfinish: (messages) => {
      game.running = false
      messages.forEach((msg) => log(msg))
    },
  })
  const onchangedir = ({ id, dir }) => {
    websocketGame.changeDir({ id, dir })
  }
  game.arena.addPlayer(
    new PlayerFE({ ...players[0], onchangedir, interval: game.timer.interval }),
  )
  game.arena.addPlayer(
    new PlayerFE({ ...players[1], onchangedir, interval: game.timer.interval }),
  )
  websocketGame.connect({
    size: properties.size,
    players,
    interval: game.timer.interval,
    onmessage: (msg) => {
      if (msg.action === 'draw') {
        this.rendererWS.draw(msg.payload)
      } else if (msg.action === 'finish') {
        console.log(msg.key, msg.payload)
      }
    },
  })
}

game.start = function () {
  document.getElementById('log').innerHTML = ''
  game.arena.reset(game.running)

  game.timer.started = new Date().getTime()
  game.timer.lastrun = null
  if (!game.running) {
    game.running = true
    game.run()
  }

  websocketGame.start()
}

game.run = function () {
  const current = new Date().getTime()

  /*
  const timediffFrame =
    game.timer.lastframe !== null ? current - game.timer.lastframe : 0
  game.timer.lastframe = current
  */

  const timediffRun =
    game.timer.lastrun !== null
      ? current - game.timer.lastrun
      : game.timer.interval

  if (timediffRun >= game.timer.interval) {
    const overlap = timediffRun - game.timer.interval
    game.timer.lastrun = current - overlap
    game.arena.run()
  }

  if (game.running) {
    window.requestAnimationFrame(() => {
      game.run()
    })
  }
}
