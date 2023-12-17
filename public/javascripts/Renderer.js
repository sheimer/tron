export class Renderer {
  constructor({ blocksize, bgColor, bordercolor, playercolors, size, id }) {
    this.width = size.x * blocksize
    this.height = size.y * blocksize
    this.blocksize = blocksize
    this.bgColor = bgColor
    this.bordercolor = bordercolor
    this.playercolors = playercolors
    this.size = size

    this.domCanvas = document.getElementById(id)
    this.canvas = null

    if (!this.domCanvas) {
      this.domCanvas = document.createElement('canvas')
      this.domCanvas.width = this.width
      this.domCanvas.height = this.height
    }
    this.canvas = this.domCanvas.getContext('2d')
  }

  draw(fields) {
    this.canvas.fillStyle = this.bgColor
    this.canvas.clearRect(0, 0, this.width - 1, this.height - 1)

    // draw field
    for (let x = 0; x < this.size.x; x++) {
      for (let y = 0; y < this.size.y; y++) {
        if (fields[x][y] !== -1) {
          const cx = x * this.blocksize
          const cy = y * this.blocksize
          if (fields[x][y] === -2) {
            this.canvas.fillStyle = this.bordercolor
            this.canvas.fillRect(cx, cy, this.blocksize, this.blocksize)
          } else if (fields[x][y] >= 0 && fields[x][y] < 6) {
            const player = fields[x][y]
            this.canvas.fillStyle = this.playercolors[player].color
            this.canvas.fillRect(cx, cy, this.blocksize, this.blocksize)
          }
        }
      }
    }
  }
}
