import { log, fisherYatesShuffle } from './include.js'
import { PlayerFE } from './PlayerFE.js'
import { Renderer } from './Renderer.js'
import { websocketGame } from './websocket.js'

export const game = {}
const properties = {
  fps: 50,
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

game.timer = {
  interval: Math.round(1000 / properties.fps),
}

game.init = function () {
  websocketGame.connect({
    size: properties.size,
    interval: game.timer.interval,
    onmessage: (msg) => {
      if (msg.action === 'draw') {
        this.rendererWS.draw(msg.payload)
      } else if (msg.action === 'finish') {
        msg.payload.forEach((msg) => log(msg))
      }
    },
  })

  game.rendererWS = new Renderer({ ...properties, id: 'arenaWS' })
  game.players = []
}

game.newGame = function (initPlayers) {
  if (initPlayers.length < 2) {
    log('At least 2 players needed!')
    return
  }
  const randomPositions = fisherYatesShuffle([
    ...properties.availablePostions[initPlayers.length - 2],
  ])

  const players = initPlayers.map((player, i) => {
    const posId = randomPositions[i]
    const pos = properties.startPositions[posId]
    const move = posId % 2 === 0 ? 1 : 3
    return { ...player, color: properties.playercolors[i], pos, move }
  })

  const onchangedir = ({ id, dir }) => {
    websocketGame.changeDir({ id, dir })
  }

  game.players.forEach((player) => player.destroy())

  game.players = [
    new PlayerFE({ ...players[0], id: 0, onchangedir }),
    new PlayerFE({ ...players[1], id: 1, onchangedir }),
  ]

  websocketGame.setPlayers(game.players)
  console.log(
    'at this point after setPlayers: somehow wit for server to send some "im ready" event!',
  )
}

game.start = function () {
  document.getElementById('log').innerHTML = ''

  game.newGame([
    {
      name: 'hidden',
      left: 75, // k
      right: 76, // l
    },
    {
      name: 'sheimer',
      left: 65, // a
      right: 83, // s
    },
  ])

  setTimeout(websocketGame.start, 1000)
}
