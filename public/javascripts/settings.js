export const AUTO = 'light dark'
export const LIGHT = 'light'
export const DARK = 'dark'

class Settings {
  theme
  coloredPlayers
  showPalette
  showGamestats

  listeners

  constructor() {
    this.listeners = {
      theme: new Set(),
      coloredPlayers: new Set(),
      showGamestats: new Set(),
      showPalette: new Set(),
    }
    this.theme = JSON.parse(localStorage.getItem('theme')) ?? AUTO

    this.coloredPlayers =
      JSON.parse(localStorage.getItem('coloredPlayers')) ?? true

    this.showPalette = JSON.parse(localStorage.getItem('showPalette')) ?? false
    this.showGamestats =
      JSON.parse(localStorage.getItem('showGamestats')) ?? false
  }

  set(key, value) {
    if (typeof this[key] === 'undefined') {
      console.log(`${key} is undefined!`)
    }
    localStorage.setItem(key, JSON.stringify(value))
    this[key] = value

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
