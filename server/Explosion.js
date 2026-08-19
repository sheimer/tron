import { getRandomInt } from '../shared/utils.js'

const getRandomRadian = () =>
  Math.round(Math.random() * 2 * Math.PI * 1000) / 1000

const getDistance = (pos1, pos2) =>
  Math.round(Math.hypot(pos1.x - pos2.x, pos1.y - pos2.y) * 100) / 100

const PIXELS_PER_FRAME = [1, 0.75, 0.5, 0.5, 0.5, 0.25, 0.25, 0.25, 0.125]

class Particle {
  constructor(center) {
    this.center = center
    this.angle = getRandomRadian()
    this.speed = PIXELS_PER_FRAME[getRandomInt(0, PIXELS_PER_FRAME.length - 1)]
    this.delay = getRandomInt(0, 12) // delay in frames
    this.start = getRandomInt(0, 4) // starting point in distance in pixel from center
    this.maxDistance = getRandomInt(18, 30) // distance from center to current pos

    this.finished = false

    this.pos = null
    this.prev = null
  }

  nextPos(frame) {
    if (this.pos !== null) {
      this.prev = { ...this.pos }
    }
    if (frame >= this.delay) {
      const isFirst = this.pos === null
      const prevPos = isFirst ? this.center : this.pos
      const speed = isFirst ? this.start : this.speed

      let addX = Math.cos(this.angle)
      let addY = Math.sin(this.angle)
      addX = Math.abs(speed * addX) * (addX < 0 ? -1 : 1)
      addY = Math.abs(speed * addY) * (addY < 0 ? -1 : 1)
      this.pos = {
        x: prevPos.x + addX,
        y: prevPos.y + addY,
      }

      if (!isFirst) {
        const distance = getDistance(this.center, this.pos)

        if (distance > this.maxDistance) {
          this.finished = true
        }
      }
    }
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

    this.frame = 0
    this.startTime = Date.now()
  }

  isExpired(maxDurationMs) {
    return Date.now() - this.startTime >= maxDurationMs
  }

  finish() {
    this.particles.forEach((particle) => {
      particle.finished = true
    })
    this.particles = []
  }

  nextPos() {
    this.particles = this.particles.filter((particle) => !particle.finished)
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].nextPos(this.frame)
    }
    this.frame++
  }
}
