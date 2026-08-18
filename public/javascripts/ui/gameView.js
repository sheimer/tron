import { settings } from '../settings.js'
import { PLAYER_COLOR_KEYS } from '/shared/constants.js'
import { ordinalSuffixOf } from '/shared/utils.js'

const canHover =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover)').matches

export class GameView {
  constructor({ onStartGame }) {
    this.onStartGame = onStartGame

    this.arenaCanvas = document.getElementById('arena')
    this.playernames = document.getElementById('playernames')
    this.scores = document.getElementById('scores')
    this.scoresWaiting = document.getElementById('scores-waiting')
    this.footer = document.getElementById('footer-game')
    this.startBtn = document.getElementById('btn-start-game')
    this.leftBtn = document.getElementById('btn-left')
    this.rightBtn = document.getElementById('btn-right')

    this.gameCounter = document.getElementById('gamecount')
    this.gameMessages = document.getElementById('messages')
    this.bodyScoreTable = document.getElementById('body-scoretable')

    this.playerPositions = [
      document.getElementById('playerpos0'),
      document.getElementById('playerpos1'),
      document.getElementById('playerpos2'),
      document.getElementById('playerpos3'),
      document.getElementById('playerpos4'),
      document.getElementById('playerpos5'),
    ]

    this.initHandlers()
  }

  initHandlers() {
    if (this.startBtn) {
      this.startBtn.onclick = () => {
        this.onStartGame()
        return false
      }
    }
  }

  updateState(state) {
    // Arena visibility
    if (this.arenaCanvas) {
      if (
        state === 'scores' ||
        state === 'scoresWaiting' ||
        state === 'finished'
      ) {
        this.arenaCanvas.style.display = 'none'
      } else if (state === 'running') {
        this.arenaCanvas.style.display = 'block'
      }
    }

    // Scoreboard visibility
    if (this.scores) {
      if (
        state === 'scores' ||
        state === 'scoresWaiting' ||
        state === 'finished'
      ) {
        this.scores.style.display = 'block'
      } else {
        this.scores.style.display = 'none'
      }
    }

    // Waiting overlay
    if (this.scoresWaiting) {
      this.scoresWaiting.style.display =
        state === 'scoresWaiting' ? 'block' : 'none'
    }

    // Player positions animation
    if (this.playernames) {
      if (state === 'running') {
        this.playernames.classList.add('active')
        setTimeout(() => {
          if (this.playernames) {
            this.playernames.classList.remove('active')
          }
        }, 2500)
      } else {
        this.playernames.classList.remove('active')
      }
    }

    // Start button readiness
    if (this.startBtn) {
      const isReady = state === 'ready' || state === 'finished'
      const setFocus = isReady && this.startBtn.disabled
      this.startBtn.disabled = !isReady
      if (setFocus) {
        this.startBtn.focus()
      }
    }

    // Touch control buttons
    if (this.leftBtn && this.rightBtn) {
      if (!canHover && (state === 'start' || state === 'running')) {
        this.leftBtn.style.display = ''
        this.rightBtn.style.display = ''
      } else {
        this.leftBtn.style.display = 'none'
        this.rightBtn.style.display = 'none'
      }
    }

    // Reset log
    if (state === 'start') {
      const logEl = document.getElementById('log')
      if (logEl) logEl.innerHTML = ''
    }
  }

  updatePlayerPositions(players, positions) {
    const posNames = {}
    players.forEach((player) => {
      if (typeof positions[player.id] !== 'undefined') {
        posNames[positions[player.id]] = player.name
      }
    })

    this.playerPositions.forEach((posEl, index) => {
      if (posEl) {
        posEl.innerHTML = ''
        const name = posNames[index] || ''
        posEl.appendChild(document.createTextNode(name))
      }
    })
  }

  updateScores(scores, players = []) {
    if (!this.bodyScoreTable) return

    const colors = settings.coloredPlayers
      ? PLAYER_COLOR_KEYS
      : Array(PLAYER_COLOR_KEYS.length).fill('fg')

    const playersById = players.reduce((acc, player, index) => {
      acc[player.id] = { ...player, renderColor: colors[index] || 'fg' }
      return acc
    }, {})

    if (this.gameCounter) {
      this.gameCounter.innerHTML = ''
      this.gameCounter.appendChild(
        document.createTextNode(ordinalSuffixOf(scores.gamecount)),
      )
    }

    if (this.gameMessages) {
      this.gameMessages.innerHTML = ''
      scores.messages.forEach((message) => {
        const div = document.createElement('div')
        if (message.playerPre && playersById[message.playerPre]) {
          const p = playersById[message.playerPre]
          const span = document.createElement('span')
          span.className = `fg-${p.renderColor}${p.isLocal ? '' : '-muted'}`
          span.appendChild(document.createTextNode(p.name))
          div.appendChild(span)
          div.appendChild(document.createTextNode(' '))
        }
        div.appendChild(document.createTextNode(message.text))
        if (message.playerPost && playersById[message.playerPost]) {
          const p = playersById[message.playerPost]
          div.appendChild(document.createTextNode(' '))
          const span = document.createElement('span')
          span.className = `fg-${p.renderColor}${p.isLocal ? '' : '-muted'}`
          span.appendChild(document.createTextNode(p.name))
          div.appendChild(span)
        }
        this.gameMessages.appendChild(div)
      })
    }

    while (this.bodyScoreTable.firstChild) {
      this.bodyScoreTable.removeChild(this.bodyScoreTable.lastChild)
    }

    const addScoreColumn = (tr, content) => {
      const td = document.createElement('td')
      td.style.textAlign = 'right'
      td.appendChild(document.createTextNode(content))
      tr.appendChild(td)
    }

    for (let i = 0; i < scores.players.length; i++) {
      const player = scores.players[i]
      const playerColor = playersById[player.id]?.renderColor ?? 'fg'

      const tr = document.createElement('tr')
      tr.className = player.isLocal
        ? `fg-${playerColor}`
        : `fg-${playerColor}-muted`

      const td = document.createElement('td')
      td.appendChild(document.createTextNode(player.name))
      tr.appendChild(td)

      addScoreColumn(tr, player.lastScore)
      addScoreColumn(tr, player.kills)
      addScoreColumn(tr, player.killed)
      addScoreColumn(tr, player.escaped)
      addScoreColumn(tr, player.total)

      this.bodyScoreTable.appendChild(tr)
    }
  }

  show() {
    if (this.arenaCanvas) this.arenaCanvas.style.display = ''
    if (this.playernames) this.playernames.style.display = ''
    if (this.footer) this.footer.style.display = ''
    if (this.startBtn) this.startBtn.style.display = ''
  }

  hide() {
    if (this.arenaCanvas) this.arenaCanvas.style.display = 'none'
    if (this.playernames) this.playernames.style.display = 'none'
    if (this.scores) this.scores.style.display = 'none'
    if (this.scoresWaiting) this.scoresWaiting.style.display = 'none'
    if (this.footer) this.footer.style.display = 'none'
  }
}
