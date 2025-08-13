import { LIGHT, DARK, AUTO, SPEED, settings } from '../settings.js'

const elements = {
  theme: {
    [AUTO]: document.getElementById('scheme-auto'),
    [LIGHT]: document.getElementById('scheme-light'),
    [DARK]: document.getElementById('scheme-dark'),
  },
  coloredPlayers: document.querySelector('#colored-players input'),
  showGamestats: document.querySelector('#show-gamestats input'),
  showPalette: document.querySelector('#show-palette input'),
  speed: document.getElementById('game-speed'),
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
 * other settings
 */
elements.coloredPlayers.checked = settings.coloredPlayers
elements.coloredPlayers.onchange = (evt) => {
  settings.set('coloredPlayers', evt.target.checked)
}

elements.showGamestats.checked = settings.showGamestats
elements.showGamestats.onchange = (evt) => {
  settings.set('showGamestats', evt.target.checked)
}

elements.showPalette.checked = settings.showPalette
elements.showPalette.onchange = (evt) => {
  settings.set('showPalette', evt.target.checked)
}

const speedByValue = Object.entries(SPEED).reduce((speeds, [key, value]) => {
  speeds[value] = key
  return speeds
}, {})
elements.speed.value = speedByValue[settings.speed]
elements.speed.onchange = (evt) => {
  settings.set('speed', SPEED[evt.target.value])
}

export class SettingsPage {
  constructor() {}

  pageHandler(state) {}
}
