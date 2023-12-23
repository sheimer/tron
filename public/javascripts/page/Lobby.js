import { Lobby } from '../Lobby.js'

const lobbyContainer = document.getElementById('lobby')
const bodyGamelistTable = document.getElementById('body-gamelisttable')
const lobbyFooter = document.getElementById('footer-lobby')
const inputGameName = document.getElementById('input-create-game')
const btnCreateGame = document.getElementById('btn-create-game')

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
      let gameName = ''
      lobbyContainer.style.display = 'block'
      lobbyFooter.style.display = 'flex'

      this.lobby = new Lobby({
        onListReceived: (list) => {
          updateGamelistTable({ list, onGameConnect: this.onGameConnect })
        },
        onGameCreated: (gameId) => {
          this.onGameConnect(gameId)
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
