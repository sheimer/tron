export const AUTO = 'light dark'
export const LIGHT = 'light'
export const DARK = 'dark'

class Settings {
  theme
  listeners

  constructor() {
    this.listeners = {
      theme: new Set(),
    }
    this.theme = localStorage.getItem('theme') ?? AUTO
  }

  set(key, value) {
    if (typeof this[key] === 'undefined') {
      console.log(`${key} is undefined!`)
    }
    localStorage.setItem(key, value)
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
