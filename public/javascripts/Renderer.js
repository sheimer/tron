export class Renderer {
  constructor({
    blocksize,
    bgColor,
    bordercolor,
    explosioncolor,
    playercolors,
    size,
    id,
  }) {
    this.width = size.x * blocksize
    this.height = size.y * blocksize
    this.blocksize = blocksize
    this.bgColor = bgColor
    this.bordercolor = bordercolor
    this.explosioncolor = explosioncolor
    this.playercolors = playercolors
    this.size = size

    this.domCanvas = document.getElementById(id)
    this.canvas = null

    this.fields = []
    for (let x = 0; x < this.size.x; x++) {
      this.fields[x] = []
      for (let y = 0; y < this.size.y; y++) {
        this.fields[x][y] = -1
      }
    }

    const screen = document.getElementById('screen')
    if (!this.domCanvas) {
      this.domCanvas = document.createElement('canvas')
      screen.insertBefore(this.domCanvas, screen.firstChild)
    }
    screen.style.width = this.width + 'px'
    screen.style.height = this.height + 'px'
    this.domCanvas.width = this.width
    this.domCanvas.height = this.height
    this.canvas = this.domCanvas.getContext('2d')
  }

  draw(changes) {
    this.canvas.fillStyle = this.bgColor
    this.canvas.clearRect(0, 0, this.width, this.height)

    for (let i = 0; i < changes.length; i++) {
      const change = changes[i]
      this.fields[change[0]][change[1]] = change[2]
    }

    // draw field
    for (let x = 0; x < this.size.x; x++) {
      for (let y = 0; y < this.size.y; y++) {
        if (this.fields[x][y] !== -1) {
          const cx = x * this.blocksize
          const cy = y * this.blocksize
          if (this.fields[x][y] === -2) {
            this.canvas.fillStyle = this.bordercolor
            this.canvas.fillRect(cx, cy, this.blocksize, this.blocksize)
          } else if (this.fields[x][y] === -3) {
            this.canvas.fillStyle = this.explosioncolor
            this.canvas.fillRect(cx, cy, this.blocksize, this.blocksize)
          } else if (this.fields[x][y] >= 0 && this.fields[x][y] < 6) {
            const player = this.fields[x][y]
            this.canvas.fillStyle = this.playercolors[player].color
            this.canvas.fillRect(cx, cy, this.blocksize, this.blocksize)
          }
        }
      }
    }
  }
}
