import { log } from './include.js'
import { PlayerFE } from './PlayerFE.js'
import { Arena } from './shared/Arena.js'
import { Renderer } from './Renderer.js'

export const game = {}
const properties = {
  fps: 20,
  width: 640,
  height: 400,
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
  interval: null,
  started: null,
  lastrun: null,
}

game.init = function () {
  const size = {
    x: properties.width / properties.blocksize,
    y: properties.height / properties.blocksize,
  }
  game.renderer = new Renderer({ ...properties, size })
  game.arena = new Arena({
    game,
    size,
    ondraw: (fields) => {
      game.renderer.draw(fields)
    },
    onfinish: (messages) => {
      game.running = false
      messages.forEach((msg) => log(msg))
    },
  })
  game.arena.addPlayer(
    new PlayerFE({
      name: 'hidden',
      color: properties.playercolors[0],
      left: 75, // k
      right: 76, // l
      pos: { x: 40, y: 100 },
      move: 1,
    }),
  )
  game.arena.addPlayer(
    new PlayerFE({
      name: 'sheimer',
      color: properties.playercolors[1],
      left: 65, // a
      right: 83, // s
      pos: { x: 279, y: 100 },
      move: 3,
    }),
  )
}

game.start = function () {
  document.getElementById('log').innerHTML = ''
  game.arena.reset()
  game.running = true
  game.timer.interval = Math.round(1000 / properties.fps)
  game.timer.started = new Date().getTime()
  game.timer.lastrun = null
  game.run()
}

game.run = function () {
  const current = new Date().getTime()

  const timediff =
    game.timer.lastrun !== null
      ? current - game.timer.lastrun
      : game.timer.interval

  if (timediff >= game.timer.interval) {
    const overlap = timediff - game.timer.interval
    game.timer.lastrun = current - overlap
    game.arena.run()
  }

  if (game.running) {
    window.requestAnimationFrame(() => {
      game.run()
    })
  }
}
