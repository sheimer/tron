import { settings } from '../settings.js'
import { Game } from '../Game.js'

const canHover = window.matchMedia('(hover: hover)').matches //true or false

const pageElements = {
  playersconfig: {
    playersconfig: document.getElementById('playersconfig'),
    gameId: document.getElementById('gameId'),
    gameName: document.getElementById('gameName'),
    footerPlayersconfig: document.getElementById('footer-playersconfig'),
  },
  game: {
    arena: document.getElementById('arena'),
    playernames: document.getElementById('playernames'),
    scores: document.getElementById('scores'),
    scoresWaiting: document.getElementById('scores-waiting'),
    footerGame: document.getElementById('footer-game'),
    startBtn: document.getElementById('btn-start-game'),
  },
}

const bodyPlayersTable = document.getElementById('body-playerstable')

const gameCounter = document.getElementById('gamecount')
const gameMessages = document.getElementById('messages')
const bodyScoreTable = document.getElementById('body-scoretable')

const inputPlayername = document.getElementById('input-add-player')
const selectKeycodes = document.getElementById('select-keycodes')
const msgNoKeycodes = document.getElementById('msg-no-keycodes')
const addPlayerForm = document.getElementById('form-add-player')
const addPlayerBtn = document.getElementById('btn-add-player')
const initBtn = document.getElementById('btn-init-game')
const leftBtn = document.getElementById('btn-left')
const rightBtn = document.getElementById('btn-right')

if (canHover) {
  selectKeycodes.required = true
  selectKeycodes.style.display = ''
  msgNoKeycodes.style.display = 'none'
} else {
  selectKeycodes.required = false
  selectKeycodes.style.display = 'none'
  msgNoKeycodes.style.display = 'block'
}

const playerPositions = [
  document.getElementById('playerpos0'),
  document.getElementById('playerpos1'),
  document.getElementById('playerpos2'),
  document.getElementById('playerpos3'),
  document.getElementById('playerpos4'),
  document.getElementById('playerpos5'),
]

export const game = {
  key: null,
  name: null,
  instance: null,
  connectedGames: JSON.parse(sessionStorage.getItem('connectedGames')) ?? {},
  addConnectedGame: () => {
    if (!game.connectedGames[game.key]) {
      game.connectedGames[game.key] = {
        localPlayers: {},
      }
      sessionStorage.setItem(
        'connectedGames',
        JSON.stringify(game.connectedGames),
      )
    }
  },
  removeConnectedGames: (keys) => {
    keys.forEach((key) => {
      delete game.connectedGames[key]
    })
    sessionStorage.setItem(
      'connectedGames',
      JSON.stringify(game.connectedGames),
    )
  },
  addLocalPlayer: (id, player) => {
    game.connectedGames[game.key].localPlayers[id] = true
    sessionStorage.setItem(
      'connectedGames',
      JSON.stringify(game.connectedGames),
    )
  },
}

const keycodes = {
  '66_78': { left: 66, right: 78 }, // b/n
  '89_88': { left: 89, right: 88 }, // y/x
  '75_76': { left: 75, right: 76 }, // k/l
  '81_87': { left: 81, right: 87 }, // q/w
  '40_39': { left: 40, right: 39 }, // <down>/<right>
  '98_99': { left: 98, right: 99 }, // <kpad 2>/<kpad 3>
  btn1_btn2: { left: 'btn-left', right: 'btn-right' }, // touch device, control buttons are created
}
const keycodesText = {
  66: 'b',
  78: 'n',
  89: 'y',
  88: 'x',
  75: 'k',
  76: 'l',
  81: 'q',
  87: 'w',
  40: '<down>',
  39: '<right>',
  98: '<kpad 2>',
  99: '<kpad 3>',
  'btn-left': 'btn left',
  'btn-right': 'btn right',
}

const ordinalSuffixOf = (i) => {
  const j = i % 10
  const k = i % 100
  if (j === 1 && k !== 11) {
    return i + 'st'
  }
  if (j === 2 && k !== 12) {
    return i + 'nd'
  }
  if (j === 3 && k !== 13) {
    return i + 'rd'
  }
  return i + 'th'
}

const updatePlayersTable = ({ list }) => {
  while (bodyPlayersTable.firstChild) {
    bodyPlayersTable.removeChild(bodyPlayersTable.lastChild)
  }

  const colors = game.instance.properties.colors[
    settings.coloredPlayers ? 'playercolors' : 'playerbw'
  ].map((color) => color.name)

  for (let i = 0; i < list.length; i++) {
    const player = list[i]
    const isLocal = player.isLocal
    const tr = document.createElement('tr')
    if (isLocal) {
      tr.className = `fg-${colors[i]}`
    } else {
      tr.className = `fg-${colors[i]}-muted`
    }
    let td = document.createElement('td')
    td.appendChild(document.createTextNode(player.name))
    tr.appendChild(td)
    td = document.createElement('td')
    if (isLocal) {
      td.appendChild(
        document.createTextNode(
          `${keycodesText[player.left]}/${keycodesText[player.right]}`,
        ),
      )
    } else {
      td.appendChild(document.createTextNode('remote player'))
    }
    tr.appendChild(td)
    td = document.createElement('td')
    // const rmvButton = document.createElement('button')
    // rmvButton.appendChild(document.createTextNode(' remove '))
    // rmvButton.onclick = () => {
    //   console.log('should be able to remove player...')
    // }
    // td.appendChild(rmvButton)
    tr.appendChild(td)
    bodyPlayersTable.appendChild(tr)
  }
}

const createPlayerSpan = (player) => {
  const span = document.createElement('span')
  span.className = `fg-${player.renderColor}${player.isLocal ? '' : '-muted'}`
  span.appendChild(document.createTextNode(player.name))
  return span
}

const updateScores = ({ scores }) => {
  const colors = game.instance.properties.colors[
    settings.coloredPlayers ? 'playercolors' : 'playerbw'
  ].map((color) => color.name)

  const playersById = game.instance.players.reduce((players, player, index) => {
    players[player.id] = { ...player, renderColor: colors[index] }
    return players
  }, {})

  gameCounter.innerHTML = ''
  gameMessages.innerHTML = ''
  gameCounter.appendChild(
    document.createTextNode(ordinalSuffixOf(scores.gamecount)),
  )
  scores.messages.forEach((message) => {
    const div = document.createElement('div')
    if (message.playerPre) {
      const span = createPlayerSpan(playersById[message.playerPre])
      div.appendChild(span)
      div.appendChild(document.createTextNode(' '))
    }
    div.appendChild(document.createTextNode(message.text))
    if (message.playerPost) {
      const span = createPlayerSpan(playersById[message.playerPost])
      div.appendChild(document.createTextNode(' '))
      div.appendChild(span)
    }
    gameMessages.appendChild(div)
  })

  const addScoreColumn = (tr, content) => {
    const td = document.createElement('td')
    td.style.textAlign = 'right'
    td.appendChild(document.createTextNode(content))
    tr.appendChild(td)
  }

  while (bodyScoreTable.firstChild) {
    bodyScoreTable.removeChild(bodyScoreTable.lastChild)
  }

  for (let i = 0; i < scores.players.length; i++) {
    const player = scores.players[i]
    const playerColor = playersById[player.id]?.renderColor ?? 'fg'

    const tr = document.createElement('tr')

    if (player.isLocal) {
      tr.className = `fg-${playerColor}`
    } else {
      tr.className = `fg-${playerColor}-muted`
    }

    const td = document.createElement('td')
    td.appendChild(document.createTextNode(player.name))
    tr.appendChild(td)

    addScoreColumn(tr, player.lastScore)
    addScoreColumn(tr, player.kills)
    addScoreColumn(tr, player.killed)
    addScoreColumn(tr, player.escaped)
    addScoreColumn(tr, player.total)

    bodyScoreTable.appendChild(tr)
  }
}

const updatePlayersPositions = ({ players, positions }) => {
  const posNames = {}
  players.forEach((player) => {
    if (typeof positions[player.id] !== 'undefined') {
      posNames[positions[player.id]] = player.name
    }
  })

  playerPositions.forEach((pos, index) => {
    const name = posNames?.[index] ?? ''
    pos.innerHTML = ''
    pos.appendChild(document.createTextNode(name))
  })
}

const enableAddPlayerIfConnected = (state) => {
  const disabled = state !== 'settingPlayers'
  inputPlayername.disabled = disabled
  selectKeycodes.disabled = canHover && disabled
}

const enableStartIfReady = (state) => {
  const disabled = !(state === 'ready' || state === 'finished')
  const setFocus = !disabled && pageElements.game.startBtn.disabled
  pageElements.game.startBtn.disabled = disabled
  if (setFocus) {
    pageElements.game.startBtn.focus()
  }
}

const resetLog = (state) => {
  if (state === 'start') {
    document.getElementById('log').innerHTML = ''
  }
}

const showPlayerPositions = (state) => {
  if (state === 'running') {
    pageElements.game.playernames.style.display = 'block'
    setTimeout(() => {
      pageElements.game.playernames.style.display = 'none'
    }, 2500)
  } else {
    pageElements.game.playernames.style.display = 'none'
  }
}

const showArena = (state) => {
  if (state === 'scores' || state === 'scoresWaiting' || state === 'finished') {
    pageElements.game.arena.style.display = 'none'
  } else if (state === 'running') {
    pageElements.game.arena.style.display = 'block'
  }
}

const showScores = (state) => {
  if (state === 'scores' || state === 'scoresWaiting' || state === 'finished') {
    pageElements.game.scores.style.display = 'block'
  } else {
    pageElements.game.scores.style.display = 'none'
  }
}

const showScoresWaiting = (state) => {
  if (state === 'scoresWaiting') {
    pageElements.game.scoresWaiting.style.display = 'block'
  } else {
    pageElements.game.scoresWaiting.style.display = 'none'
  }
}

const showPlayerControlButtons = (state) => {
  if (!canHover && (state === 'start' || state === 'running')) {
    leftBtn.style.display = ''
    rightBtn.style.display = ''
  } else {
    leftBtn.style.display = 'none'
    rightBtn.style.display = 'none'
  }
}

export class GamePage {
  constructor({ toGameMode }) {
    this.toGameMode = () => {
      toGameMode()
    }
    this.currentPage = 'playersconfig'
    this.currentScores = { gamecount: 0, players: [], messages: [] }

    this.onSettingsChange = this.onSettingsChange.bind(this)

    settings.addListener('coloredPlayers', this.onSettingsChange)
  }

  destroy() {
    settings.removeListener('coloredPlayers', this.onSettingsChange)
  }

  onSettingsChange() {
    if (game.instance === null) {
      return
    }
    if (this.currentPage === 'playersconfig') {
      updatePlayersTable({ list: game.instance.players })
    } else if (
      game.instance.state === 'scores' ||
      game.instance.state === 'finished'
    ) {
      updateScores({ scores: this.currentScores })
    }
  }

  pageHandler(pageState) {
    this.currentPage = pageState
    if (pageState === 'playersconfig') {
      Object.values(pageElements.game).forEach((element) => {
        element.style.display = 'none'
      })
      Object.values(pageElements.playersconfig).forEach((element) => {
        element.style.display = ''
      })

      game.instance = new Game({
        key: game.key,
        localPlayers: game.connectedGames[game.key]?.localPlayers ?? {
          localPlayers: {},
        },
        stateHandler: [
          enableAddPlayerIfConnected,
          enableStartIfReady,
          resetLog,
          showPlayerPositions,
          showArena,
          showScores,
          showScoresWaiting,
          showPlayerControlButtons,
        ],
        onPlayersUpdate: (players) => {
          updatePlayersTable({ list: players })
          initBtn.disabled = players.length < 2
          if (players.length >= 6) {
            inputPlayername.disabled = true
            selectKeycodes.disabled = true
            addPlayerBtn.disabled = true
          }
        },
        onPlayersPositions: ({ players, positions }) => {
          updatePlayersPositions({ players, positions })
          this.toGameMode()
        },
        onConnected: (gameState) => {
          if (gameState.started) {
            this.toGameMode()
          }
        },
        onScoresUpdate: (scores) => {
          this.currentScores = scores
          updateScores({ scores })
        },
      })

      pageElements.playersconfig.gameId.textContent = game.key
      pageElements.playersconfig.gameName.textContent = game.name

      let playername = ''
      let playerkeys = ''

      const isAddPlayerAvailable = () => {
        addPlayerBtn.disabled = !(playername.length && playerkeys.length)
      }

      inputPlayername.onkeyup = (evt) => {
        playername = evt.target.value
        isAddPlayerAvailable()
      }
      inputPlayername.onkeyup({ target: inputPlayername })

      selectKeycodes.onchange = (evt) => {
        playerkeys = evt.target.value
        isAddPlayerAvailable()
      }
      selectKeycodes.onchange({ target: selectKeycodes })
      if (!canHover) {
        playerkeys = 'btn1_btn2'
        isAddPlayerAvailable()
      }

      addPlayerForm.onsubmit = () => {
        if (!addPlayerBtn.disabled) {
          const left = keycodes[playerkeys].left
          const right = keycodes[playerkeys].right
          const id = game.instance.addPlayer({
            name: playername,
            left,
            right,
          })
          game.addLocalPlayer(id, {
            name: playername,
            left,
            right,
          })
        }
        return false
      }

      initBtn.onclick = () => {
        game.instance.start()
        return false
      }
    } else if (pageState === 'game') {
      Object.values(pageElements.playersconfig).forEach((element) => {
        element.style.display = 'none'
      })
      pageElements.game.footerGame.style.display = ''
      pageElements.game.startBtn.style.display = ''
      pageElements.game.arena.style.display = ''
      pageElements.game.playernames.style.display = ''

      pageElements.game.startBtn.onclick = () => {
        game.instance.start()
        return false
      }
    } else {
      Object.values(pageElements.game).forEach((element) => {
        element.style.display = 'none'
      })
      Object.values(pageElements.playersconfig).forEach((element) => {
        element.style.display = 'none'
      })
    }
  }
}
