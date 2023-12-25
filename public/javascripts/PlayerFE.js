import { Player } from './shared/Player.js'

export class PlayerFE extends Player {
  constructor({ onchangedir, ...properties }) {
    super(properties)
    this.onchangedir = onchangedir

    // to give proper "this"
    if (this.onchangedir !== null) {
      this.onkeydown = (evt) => {
        this._onkeydown(evt)
      }

      document.addEventListener('keydown', this.onkeydown)
    }
  }

  destroy() {
    if (this.onchangedir !== null) {
      document.removeEventListener('keydown', this.onkeydown)
    }
  }

  _onkeydown(evt) {
    if (evt.keyCode === this.left) {
      this.changeDir('left')
    } else if (evt.keyCode === this.right) {
      this.changeDir('right')
    }
  }

  changeDir(dir) {
    if (this.onchangedir === null) {
      return
    }
    super.changeDir(dir)
    this.onchangedir({ id: this.id, dir })
  }
}
