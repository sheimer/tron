import { AUTO, DARK, settings } from './settings.js'

const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')

const colorClassesSheet = new CSSStyleSheet()
document.adoptedStyleSheets.push(colorClassesSheet)

document.body.style.colorScheme = settings.theme

const colors = {}
const listeners = []

const testContainer = document.querySelector('#palette div')

const colorVars = []
Array.from(document.styleSheets).forEach((styleSheet) => {
  const cssRules = Array.from(styleSheet.cssRules)
  cssRules.forEach((rule) => {
    if (rule.selectorText === ':root') {
      Array.from(rule.style).forEach((prop) => {
        if (prop.startsWith('--color')) {
          colorVars.push(prop)
        }
      })
    }
  })
})

const setColors = (isDark) => {
  colorClassesSheet.replaceSync('')

  for (let i = 0; i < colorVars.length; i++) {
    const varName = colorVars[i]
    if (varName.startsWith('--color-')) {
      const name = varName.replace('--color-', '')

      colorClassesSheet.insertRule(`.fg-${name} { color: var(${varName}); }`)
      colorClassesSheet.insertRule(
        `.bg-${name} { background-color: var(${varName}); }`,
      )

      const group = name.split('-')[0]
      let divGroup = document.querySelector(`#palette .group-${group}`)
      if (divGroup === null) {
        divGroup = document.createElement('div')
        divGroup.className = `group-${group} flex-column`
        divGroup.title = varName
        testContainer.appendChild(divGroup)
      }

      let divColor = document.querySelector(`#palette .bg-${name}`)
      if (divColor === null) {
        divColor = document.createElement('div')
        divColor.className = `color bg-${name} fg-${name}`
        divColor.title = varName
        divGroup.appendChild(divColor)
      }

      const compStyle = window.getComputedStyle(divColor)
      colors[name] = compStyle.getPropertyValue('color')
    }
  }
}

let systemIsDark = darkThemeMq.matches
let themeIsDark =
  settings.theme === AUTO ? systemIsDark : settings.theme === DARK

setColors(themeIsDark)

darkThemeMq.addListener((e) => {
  systemIsDark = e.matches
  if (settings.theme === AUTO) {
    setColors(systemIsDark)
    listeners.forEach((listener) => {
      listener()
    })
  }
})

settings.addListener('theme', (theme) => {
  document.body.style.colorScheme = theme
  const isDark = theme === 'light dark' ? systemIsDark : theme === 'dark'
  setColors(isDark)
})

export const cssColors = colors
