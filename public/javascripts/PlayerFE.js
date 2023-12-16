import { Player } from './shared/Player.js'

export class PlayerFE extends Player {
  constructor(args) {
    super(args)
    document.addEventListener('keydown', (evt) => this.onkeydown(evt))
  }

  onkeydown(evt) {
    if (evt.keyCode === this.left) {
      this.changeDir('left')
    } else if (evt.keyCode === this.right) {
      this.changeDir('right')
    }
  }
}
