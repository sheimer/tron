import { Game } from '../Game.js'

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
    footerGame: document.getElementById('footer-game'),
    startBtn: document.getElementById('btn-start-game'),
  },
}

const bodyPlayersTable = document.getElementById('body-playerstable')

const inputPlayername = document.getElementById('input-add-player')
const selectKeycodes = document.getElementById('select-keycodes')
const addPlayerBtn = document.getElementById('btn-add-player')
const initBtn = document.getElementById('btn-init-game')

const playerPositions = [
  document.getElementById('playerpos0'),
  document.getElementById('playerpos1'),
  document.getElementById('playerpos2'),
  document.getElementById('playerpos3'),
  document.getElementById('playerpos4'),
  document.getElementById('playerpos5'),
]

const keycodes = {
  '66_78': { left: 66, right: 78 }, // b/n
  '89_88': { left: 89, right: 88 }, // y/x
  '75_76': { left: 75, right: 76 }, // k/l
  '81_87': { left: 81, right: 87 }, // q/w
  '40_39': { left: 40, right: 39 }, // <down>/<right>
  '98_99': { left: 98, right: 99 }, // <kpad 2>/<kpad 3>
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
}

const updatePlayersTable = ({ list }) => {
  while (bodyPlayersTable.firstChild) {
    bodyPlayersTable.removeChild(bodyPlayersTable.lastChild)
  }

  for (let i = 0; i < list.length; i++) {
    const isLocal = list[i].isLocal
    const tr = document.createElement('tr')
    if (!isLocal) {
      tr.style.color = '#666666'
    }
    let td = document.createElement('td')
    td.appendChild(document.createTextNode(list[i].name))
    tr.appendChild(td)
    td = document.createElement('td')
    if (isLocal) {
      td.appendChild(
        document.createTextNode(
          `${keycodesText[list[i].left]}/${keycodesText[list[i].right]}`,
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

const updatePlayersPositions = ({ players, positions }) => {
  console.log(players)
  console.log(positions)
  playerPositions.forEach((pos, index) => {
    const id =
      Object.entries(positions).find(
        ([key, playerpos]) => playerpos === index,
      )?.[0] ?? null
    const name = id !== null ? players.name : ''
    pos.innerHTML = ''
    pos.appendChild(document.createTextNode(name))
  })
}

export const game = {
  key: null,
  name: null,
  instance: null,
}

const enableAddPlayerIfConnected = (state) => {
  const disabled = state !== 'settingPlayers'
  inputPlayername.disabled = disabled
  selectKeycodes.disabled = disabled
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

export class GamePage {
  constructor({ toGameMode }) {
    this.toGameMode = () => {
      toGameMode()
      game.instance.setState('ready')
      console.log(
        'shows gamescreen and enables "start" button...buut start button should be removed, and game starts at once',
      )
    }
  }

  pageHandler(pageState) {
    console.log('page game receiving page state ', pageState)
    if (pageState === 'playersconfig') {
      Object.values(pageElements.game).forEach((element) => {
        element.style.display = 'none'
      })
      Object.values(pageElements.playersconfig).forEach((element) => {
        element.style.display = element.id.startsWith('footer')
          ? 'flex'
          : element.tagName === 'SPAN'
            ? ''
            : 'block'
      })

      game.instance = new Game({
        key: game.key,
        stateHandler: [
          // addPlayersBeforeProperlyImplemented,
          enableAddPlayerIfConnected,
          enableStartIfReady,
          resetLog,
        ],
        onPlayersUpdate: (players) => {
          updatePlayersTable({ list: players })
          initBtn.disabled = players.length < 2
        },
        onPlayersPositions: ({ players, positions }) => {
          updatePlayersPositions({ players, positions })
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

      addPlayerBtn.onclick = () => {
        game.instance.addPlayer({
          name: playername,
          left: keycodes[playerkeys].left,
          right: keycodes[playerkeys].right,
        })
        return false
      }

      initBtn.onclick = () => {
        this.toGameMode()
      }
    } else if (pageState === 'game') {
      Object.values(pageElements.playersconfig).forEach((element) => {
        element.style.display = 'none'
      })
      pageElements.game.footerGame.style.display = 'flex'
      pageElements.game.startBtn.style.display = 'block'
      pageElements.game.arena.style.display = 'block'
      pageElements.game.playernames.style.display = 'block'

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
