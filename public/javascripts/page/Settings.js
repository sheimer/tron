import { LIGHT, DARK, AUTO, settings } from '../settings.js'

const elements = {
  theme: {
    [AUTO]: document.getElementById('scheme-auto'),
    [LIGHT]: document.getElementById('scheme-light'),
    [DARK]: document.getElementById('scheme-dark'),
  },
  coloredPlayers: document.querySelector('#colored-players input'),
}

/**
 * theme
 */
Object.entries(elements.theme).forEach(([theme, button]) => {
  button.onclick = () => {
    settings.set('theme', theme)
  }
})

const setTheme = (newTheme) => {
  Object.entries(elements.theme).forEach(([theme, button]) => {
    if (theme === newTheme) {
      button.classList.add('selected')
    } else {
      button.classList.remove('selected')
    }
  })
}

setTheme(settings.theme)

settings.addListener('theme', setTheme)

/**
 * coloredPlayers
 */
elements.coloredPlayers.onchange = (evt) => {
  settings.set('coloredPlayers', evt.target.checked)
}
elements.coloredPlayers.checked = settings.coloredPlayers

export class Settings {
  constructor() {}

  pageHandler(state) {
    console.log('page state in Settings')
  }
}
