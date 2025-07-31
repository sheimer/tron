import { Lobby } from '../Lobby.js'
import { game } from './Game.js'

const lobbyContainer = document.getElementById('lobby')
const bodyGamelistTable = document.getElementById('body-gamelisttable')
const lobbyFooter = document.getElementById('footer-lobby')
const formCreateGame = document.getElementById('form-create-game')
const inputGameName = document.getElementById('input-create-game')
const btnCreateGame = document.getElementById('btn-create-game')

const updateGamelistTable = ({ list, connectGame }) => {
  while (bodyGamelistTable.firstChild) {
    bodyGamelistTable.removeChild(bodyGamelistTable.lastChild)
  }

  for (let i = 0; i < list.length; i++) {
    const tr = document.createElement('tr')
    let td = document.createElement('td')
    td.appendChild(document.createTextNode(list[i].key))
    tr.appendChild(td)
    td = document.createElement('td')
    td.appendChild(document.createTextNode(list[i].name))
    tr.appendChild(td)
    td = document.createElement('td')
    td.appendChild(document.createTextNode(list[i].numPlayers))
    tr.appendChild(td)
    td = document.createElement('td')
    td.appendChild(
      document.createTextNode(list[i].acceptingPlayers ? 'waiting' : 'running'),
    )
    tr.appendChild(td)
    td = document.createElement('td')
    const startButton = document.createElement('button')
    startButton.appendChild(document.createTextNode(' join '))
    startButton.onclick = () => {
      connectGame(list[i].key, list[i].name)
    }

    const gameReconnectPossible =
      game.connectedGames[list[i].key] &&
      Object.keys(game.connectedGames[list[i].key].localPlayers).length
    startButton.disabled = !list[i].acceptingPlayers && !gameReconnectPossible

    td.appendChild(startButton)
    tr.appendChild(td)
    bodyGamelistTable.appendChild(tr)
  }
}

export class LobbyPage {
  constructor({ connectGame }) {
    this.lobby = null
    this.connectGame = connectGame
  }

  pageHandler(state) {
    if (state === 'lobby') {
      let gameName = ''

      this.lobby = new Lobby({
        onConnect: () => {
          lobbyContainer.style.display = ''
          lobbyFooter.style.display = ''
        },
        onListReceived: (list) => {
          const localGames = Object.keys(game.connectedGames)
          const removeGames = []
          localGames.forEach((localGame) => {
            if (!list.some((serverGame) => serverGame.key === localGame)) {
              removeGames.push(localGame)
            }
          })
          if (removeGames.length) {
            game.removeConnectedGames(removeGames)
          }
          updateGamelistTable({ list, connectGame: this.connectGame })
        },
        onGameCreated: (gameId) => {
          this.connectGame(gameId, gameName)
        },
      })

      inputGameName.onkeyup = (evt) => {
        gameName = evt.target.value
        btnCreateGame.disabled = !gameName.length
      }
      inputGameName.onkeyup({ target: inputGameName })

      formCreateGame.onsubmit = () => {
        if (!btnCreateGame.disabled) {
          this.lobby.createGame(gameName)
        }
        return false
      }
    } else {
      lobbyContainer.style.display = 'none'
      lobbyFooter.style.display = 'none'

      this.lobby.disconnect()
    }
  }
}
