import { Lobby } from '../Lobby.js'

const lobbyContainer = document.getElementById('lobby')
const bodyGamelistTable = document.getElementById('body-gamelisttable')
const lobbyFooter = document.getElementById('footer-lobby')
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
    const startButton = document.createElement('Button')
    startButton.appendChild(document.createTextNode('join'))
    startButton.onclick = () => {
      connectGame(list[i].key)
    }
    startButton.disabled = !list[i].acceptingPlayers
    td.appendChild(startButton)
    tr.appendChild(td)
    bodyGamelistTable.appendChild(tr)
  }
  console.log(bodyGamelistTable)
  console.log(list)
}

export class LobbyPage {
  constructor({ connectGame }) {
    this.lobby = null
    this.connectGame = connectGame
  }

  pageHandler(state) {
    if (state === 'lobby') {
      let gameName = ''
      lobbyContainer.style.display = 'block'
      lobbyFooter.style.display = 'flex'

      this.lobby = new Lobby({
        onListReceived: (list) => {
          updateGamelistTable({ list, connectGame: this.connectGame })
        },
        onGameCreated: (gameId) => {
          this.connectGame(gameId)
        },
      })

      inputGameName.onkeyup = (evt) => {
        gameName = evt.target.value
        btnCreateGame.disabled = !gameName.length
      }

      btnCreateGame.onclick = () => {
        this.lobby.createGame(gameName)
        return false
      }
    } else {
      lobbyContainer.style.display = 'none'
      lobbyFooter.style.display = 'none'

      this.lobby.disconnect()
    }
  }
}
