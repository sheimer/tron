import { Lobby } from '../Lobby.js'

const lobbyContainer = document.getElementById('lobby')

const btnCreateGame = document.getElementById('btn-create-game')
const bodyGamelistTable = document.getElementById('body-gamelisttable')

const updateGamelistTable = ({ list, onGameConnect }) => {
  console.log(bodyGamelistTable)
  console.log(list)
}

export class LobbyPage {
  constructor({ onGameConnect }) {
    this.lobby = null
    this.onGameConnect = onGameConnect
  }

  pageHandler(state) {
    if (state === 'lobby') {
      lobbyContainer.style.display = ''
      btnCreateGame.style.display = ''

      this.lobby = new Lobby({
        onListReceived: (list) => {
          updateGamelistTable({ list, onGameConnect: this.onGameConnect })
        },
        onGameCreated: (gameId) => {
          this.onGameConnect(gameId)
        },
      })

      btnCreateGame.onclick = () => {
        this.lobby.createGame()
      }
    } else {
      lobbyContainer.style.display = 'none'
      btnCreateGame.style.display = 'none'

      this.lobby.disconnect()
    }
  }
}
