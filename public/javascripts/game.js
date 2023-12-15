import { Arena } from './arena.class.js'

export const game = {}
game.hParams = {
  iFps: 20,
  iWidth: 640,
  iHeight: 480,
  iBlockSize: 2,
  sBGColor: 'rgb(255,255,255)',
  sBorderColor: 'rgb(0,0,0)',
}

game.timer = {
  interval: null,
  started: null,
  lastrun: null,
}

game.init = function () {
  game.oArena = new Arena(game)
  game.oArena.addPlayer()
  game.oArena.addPlayer(
    'sheimer',
    'rgb(120,120,120)',
    65 /* a */,
    83 /* s */,
    { x: 279, y: 120 },
    3,
  )
}

game.start = function () {
  document.getElementById('log').innerHTML = ''
  game.oArena.reset()
  game.running = true
  game.timer.interval = Math.round(1000 / game.hParams.iFps)
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
    game.oArena.run()
  }

  window.requestAnimationFrame(() => {
    if (game.running) {
      game.run()
    }
  })
}
