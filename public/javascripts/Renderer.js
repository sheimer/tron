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
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#monitoring_screen_resolution_or_zoom_level_changes
    console.log('change of devicePixelRatio: see link in comment above')
    console.log(
      'plus missing: orientation horizontal on phone - max width depending on 100% height instead of the other way round!',
    )

    const multiplicator = getComputedStyle(document.body).getPropertyValue(
      '--multiplicator',
    )

    this.blocksize = blocksize * multiplicator

    this.width = size.x * this.blocksize
    this.height = size.y * this.blocksize
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
        const field = this.fields[x][y]
        if (field !== -1) {
          const cx = x * this.blocksize
          const cy = y * this.blocksize
          if (field === -2) {
            this.canvas.fillStyle = this.bordercolor
            this.canvas.fillRect(cx, cy, this.blocksize, this.blocksize)
          } else if (field === -3) {
            this.canvas.fillStyle = this.explosioncolor
            this.canvas.fillRect(cx, cy, this.blocksize, this.blocksize)
          } else if (field >= 0 && field < 6) {
            const player = field
            this.canvas.fillStyle = this.playercolors[player]
            this.canvas.fillRect(cx, cy, this.blocksize, this.blocksize)
          }
        }
      }
    }
  }
}
