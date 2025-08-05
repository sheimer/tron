import { LIGHT, DARK, AUTO, settings } from '../settings.js'

const buttons = {
  theme: {
    [AUTO]: document.getElementById('scheme-auto'),
    [LIGHT]: document.getElementById('scheme-light'),
    [DARK]: document.getElementById('scheme-dark'),
  },
}

Object.entries(buttons.theme).forEach(([theme, button]) => {
  button.onclick = () => {
    settings.set('theme', theme)
  }
})

const setTheme = (newTheme) => {
  console.log(buttons.theme[newTheme])
  Object.entries(buttons.theme).forEach(([theme, button]) => {
    if (theme === newTheme) {
      button.classList.add('selected')
    } else {
      button.classList.remove('selected')
    }
  })
}

setTheme(settings.theme)

settings.addListener('theme', setTheme)

export class Settings {
  constructor() {}

  pageHandler(state) {
    console.log('page state in Settings')
  }
}
