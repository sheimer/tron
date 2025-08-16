import { Player } from './shared/Player.js'

const leftBtn = document.getElementById('btn-left')
const rightBtn = document.getElementById('btn-right')

export class PlayerFE extends Player {
  constructor({ onchangedir, isLocal, ...properties }) {
    super(properties)
    this.onchangedir = onchangedir
    this.isLocal = isLocal

    this.onkeydown = this.onkeydown.bind(this)
    this.onbuttonpress = this.onbuttonpress.bind(this)
    if (this.onchangedir !== null) {
      if (typeof this.left === 'number') {
        document.addEventListener('keydown', this.onkeydown)
      } else {
        leftBtn.addEventListener('click', this.onbuttonpress)
        rightBtn.addEventListener('click', this.onbuttonpress)
      }
    }
  }

  destroy() {
    if (this.onchangedir !== null) {
      document.removeEventListener('keydown', this.onkeydown)
      leftBtn.removeEventListener('click', this.onbuttonpress)
      rightBtn.removeEventListener('click', this.onbuttonpress)
    }
  }

  onkeydown(evt) {
    if (evt.repeat) {
      return
    }
    if (evt.keyCode === this.left) {
      this.changeDir('left')
    } else if (evt.keyCode === this.right) {
      this.changeDir('right')
    }
  }

  onbuttonpress(evt) {
    if (evt.target.id.includes('left')) {
      this.changeDir('left')
    } else if (evt.target.id.includes('right')) {
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
