export const AUTO = 'light dark'
export const LIGHT = 'light'
export const DARK = 'dark'

class Settings {
  theme
  coloredPlayers
  listeners

  constructor() {
    this.listeners = {
      theme: new Set(),
      coloredPlayers: new Set(),
    }
    this.theme = JSON.parse(localStorage.getItem('theme')) ?? AUTO
    this.coloredPlayers =
      JSON.parse(localStorage.getItem('coloredPlayers')) ?? true
  }

  set(key, value) {
    if (typeof this[key] === 'undefined') {
      console.log(`${key} is undefined!`)
    }
    localStorage.setItem(key, JSON.stringify(value))
    this.key = value

    this.listeners[key].forEach((listener) => {
      listener(value)
    })
  }

  addListener(key, listener) {
    if (typeof this[key] === 'undefined') {
      console.log(`${key} is undefined!`)
    }
    this.listeners[key].add(listener)
  }

  removeListener(key, listener) {
    if (typeof this[key] === 'undefined') {
      console.log(`${key} is undefined!`)
    }
    this.listeners[key].delete(listener)
  }
}

export const settings = new Settings()
