import { Lobby } from '../Lobby.js'
import { state } from '../state.js'

export class LobbyView {
  constructor({ onSelectGame }) {
    this.onSelectGame = onSelectGame
    this.lobby = null

    this.container = document.getElementById('lobby')
    this.footer = document.getElementById('footer-lobby')
    this.bodyGamelistTable = document.getElementById('body-gamelisttable')
    this.formCreateGame = document.getElementById('form-create-game')
    this.inputGameName = document.getElementById('input-create-game')
    this.btnCreateGame = document.getElementById('btn-create-game')

    this.initCreateForm()
  }

  initCreateForm() {
    let gameName = ''

    if (this.inputGameName && this.btnCreateGame) {
      this.inputGameName.onkeyup = (evt) => {
        gameName = evt.target.value.trim()
        this.btnCreateGame.disabled = !gameName.length
      }

      if (this.formCreateGame) {
        this.formCreateGame.onsubmit = () => {
          if (!this.btnCreateGame.disabled && this.lobby) {
            this.lobby.createGame(gameName)
          }
          return false
        }
      }
    }
  }

  updateGamelistTable(list) {
    if (!this.bodyGamelistTable) return

    while (this.bodyGamelistTable.firstChild) {
      this.bodyGamelistTable.removeChild(this.bodyGamelistTable.lastChild)
    }

    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      const tr = document.createElement('tr')

      // Key
      const tdKey = document.createElement('td')
      tdKey.appendChild(document.createTextNode(item.key))
      tr.appendChild(tdKey)

      // Name
      const tdName = document.createElement('td')
      tdName.appendChild(document.createTextNode(item.name))
      tr.appendChild(tdName)

      // Number of Players
      const tdPlayers = document.createElement('td')
      tdPlayers.appendChild(document.createTextNode(item.numPlayers))
      tr.appendChild(tdPlayers)

      // Status
      const tdStatus = document.createElement('td')
      tdStatus.appendChild(
        document.createTextNode(item.acceptingPlayers ? 'waiting' : 'running'),
      )
      tr.appendChild(tdStatus)

      // Action / Join button
      const tdAction = document.createElement('td')
      const joinButton = document.createElement('button')
      joinButton.appendChild(document.createTextNode(' join '))

      joinButton.onclick = () => {
        this.onSelectGame(item.key, item.name)
      }

      const isReconnectable =
        state.connectedGames[item.key] &&
        Object.keys(state.connectedGames[item.key].localPlayers || {}).length > 0

      joinButton.disabled = !item.acceptingPlayers && !isReconnectable

      tdAction.appendChild(joinButton)
      tr.appendChild(tdAction)

      this.bodyGamelistTable.appendChild(tr)
    }
  }

  show() {
    if (this.container) this.container.style.display = ''
    if (this.footer) this.footer.style.display = ''

    this.lobby = new Lobby({
      onConnect: () => {},
      onListReceived: (list) => {
        // Clean up stale connected games from sessionStorage
        const localGameKeys = Object.keys(state.connectedGames)
        const staleKeys = localGameKeys.filter(
          (key) => !list.some((serverGame) => serverGame.key === key),
        )
        if (staleKeys.length) {
          state.removeConnectedGames(staleKeys)
        }
        state.set('gamesList', list)
        this.updateGamelistTable(list)
      },
      onGameCreated: (gameId) => {
        const gameName = this.inputGameName ? this.inputGameName.value.trim() : ''
        this.onSelectGame(gameId, gameName)
      },
    })
  }

  hide() {
    if (this.container) this.container.style.display = 'none'
    if (this.footer) this.footer.style.display = 'none'

    if (this.lobby) {
      this.lobby.disconnect()
      this.lobby = null
    }
  }
}
