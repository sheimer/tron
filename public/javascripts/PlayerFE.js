import { Player } from './shared/Player.js'

export class PlayerFE extends Player {
  constructor({ onchangedir, ...properties }) {
    super(properties)
    this.onchangedir = onchangedir
    document.addEventListener('keydown', (evt) => this.onkeydown(evt))
  }

  onkeydown(evt) {
    if (evt.keyCode === this.left) {
      this.changeDir('left')
    } else if (evt.keyCode === this.right) {
      this.changeDir('right')
    }
  }

  changeDir(dir) {
    super.changeDir(dir)
    this.onchangedir({ id: this.id, dir })
  }
}
