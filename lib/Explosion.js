const getRandomInt = (min, max) => ((Math.random() * (max - min)) | 0) + min

const _pixelPerFrame = [1, 0.75, 0.5, 0.25]

class Particle {
  constructor(center) {
    this.center = center
    this.speed = _pixelPerFrame[getRandomInt(0, _pixelPerFrame.length - 1)]
    this.start = getRandomInt(0, 5)
    this.length = getRandomInt(3, 15)
    this.delay = getRandomInt(0, 10)
    this.angle = getRandomInt(0, 359)

    this.pos = null
  }

  nextPos(frame) {
    // self.px.X := round(self.px.X + self.speed * cos(DegToRad(direction)));
    // self.px.Y := round(self.px.Y + Self.speed * sin(DegToRad(direction)));
  }
}

export class Explosion {
  constructor({ id, pos }) {
    this.id = id
    this.center = pos

    const numberParticles = getRandomInt(16, 20)
    this.particles = []
    for (let i = 0; i < numberParticles; i++) {
      this.particles.push(new Particle(this.center))
    }
    console.log(this.particles)

    this.frame = 0
  }

  nextPos() {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].nextPos(this.frame)
    }
    this.frame++
  }
}
