import { Player } from './player.class.js'
import { log } from './include.js'

export const Arena = function (game) {
  this.game = game
  this.sBorderColor = game.hParams.sBorderColor || 'rgb(0,0,0)'
  this.sBGColor = game.hParams.sBGColor || 'rgb(255,255,255)'
  this.iBlockSize = game.hParams.iBlockSize || 2
  this.iWidth = game.hParams.iWidth || 640
  this.iHeight = game.hParams.iHeight || 480
  this.domCanvas = document.getElementById('arena')
  this.oCanvas = null
  this.aoPlayer = []
  this.aaField = null
  /*
      -3:  explosion
      -2:  border
      -1:  empty
      0-5: player
    */
  this.hSize = null
  this.iEscaped = null
  this.init()
}
Arena.prototype = {
  init: function () {
    if (!this.domCanvas) {
      this.domCanvas = document.createElement('canvas')
    }
    if (!this.oCanvas) {
      this.domCanvas.width = this.iWidth
      this.domCanvas.height = this.iHeight
      this.oCanvas = this.domCanvas.getContext('2d')
      this.hSize = {
        x: this.iWidth / this.iBlockSize,
        y: this.iHeight / this.iBlockSize,
      }
    }

    this.iEscaped = -1

    this.aaField = []
    for (let x = 0; x < this.hSize.x; x++) {
      this.aaField[x] = []
      for (let y = 0; y < this.hSize.y; y++) {
        if (
          x === 0 ||
          y === 0 ||
          x === this.hSize.x - 1 ||
          y === this.hSize.y - 1
        ) {
          this.aaField[x][y] = -2
        } else {
          this.aaField[x][y] = -1
        }
      }
    }
    this.draw()
  },

  reset: function () {
    if (this.game.running) {
      this.finish()
    }
    for (let i = 0; i < this.aoPlayer.length; i++) {
      this.aoPlayer[i].reset()
    }
    this.init()
  },

  addPlayer: function (sName, sColor, iLeft, iRight, hPos, iMove) {
    const oPlayer = new Player(
      sName,
      sColor,
      iLeft,
      iRight,
      hPos,
      iMove,
      this.iBlockSize,
    )
    this.aoPlayer.push(oPlayer)
    this.aaField[oPlayer.hPos.x][oPlayer.hPos.y] = this.aoPlayer.length - 1
    this.draw()
  },

  draw: function () {
    this.oCanvas.fillStyle = this.sBGColor
    this.oCanvas.clearRect(0, 0, this.iWidth - 1, this.iHeight - 1)

    // draw field
    for (let x = 0; x < this.hSize.x; x++) {
      for (let y = 0; y < this.hSize.y; y++) {
        if (this.aaField[x][y] !== -1) {
          const iCX = x * this.iBlockSize
          const iCY = y * this.iBlockSize
          if (this.aaField[x][y] === -2) {
            this.oCanvas.fillStyle = this.sBorderColor
            this.oCanvas.fillRect(iCX, iCY, this.iBlockSize, this.iBlockSize)
          } else if (this.aaField[x][y] >= 0 && this.aaField[x][y] < 6) {
            const iPlayer = this.aaField[x][y]
            this.oCanvas.fillStyle = this.aoPlayer[iPlayer].sColor
            this.oCanvas.fillRect(iCX, iCY, this.iBlockSize, this.iBlockSize)
          }
        }
      }
    }
  },

  finish: function () {
    this.game.running = false
    log('game finished...')
    for (let i = 0; i < this.aoPlayer.length; i++) {
      const oPlayer = this.aoPlayer[i]
      if (oPlayer.iKilledBy !== -1) {
        const sKiller =
          oPlayer.iKilledBy === -2
            ? 'wall'
            : this.aoPlayer[oPlayer.iKilledBy].sName
        log('&nbsp;&nbsp;' + oPlayer.sName + ' killed by ' + sKiller + '!')
      }
    }
    if (this.iEscaped >= 0) {
      log('&nbsp;&nbsp;' + this.aoPlayer[this.iEscaped].sName + ' escaped!')
    } else {
      for (let i = 0; i < this.aoPlayer.length; i++) {
        const oPlayer = this.aoPlayer[i]
        if (oPlayer.bAlive) {
          log('&nbsp;&nbsp;' + oPlayer.sName + ' wins!')
        }
      }
    }
  },

  run: function () {
    let bFinished = 0
    let iPlayersLeft = 0

    // calc new positions --> loop players, set their new pos
    for (let i = 0; i < this.aoPlayer.length; i++) {
      const oPlayer = this.aoPlayer[i]
      if (oPlayer.bAlive) {
        oPlayer.move()
      }
    }

    // calc explosions

    // check on collisions --> incl. 2 in 1 spot detection
    for (let i = 0; i < this.aoPlayer.length; i++) {
      const oPlayer = this.aoPlayer[i]
      if (oPlayer.bAlive) {
        const iX = oPlayer.hPos.x
        const iY = oPlayer.hPos.y
        if (this.aaField[iX][iY] !== -1) {
          oPlayer.bAlive = 0
          oPlayer.iKilledBy = this.aaField[iX][iY]
          // start explosion !!!!!
        } else {
          if (
            iX === 0 ||
            iX === this.hSize.x - 1 ||
            iY === 0 ||
            iY === this.hSize.y - 1
          ) {
            oPlayer.bEscaped = 1
            bFinished = 1
          } else {
            iPlayersLeft++
          }
        }
        this.aaField[iX][iY] = i
      }
    }

    // finished...
    this.draw()
    if (bFinished || iPlayersLeft <= 1) {
      this.finish()
    }
  },
}
