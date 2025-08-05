export const AUTO = 'light dark'
export const LIGHT = 'light'
export const DARK = 'dark'

const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')

const colorClassesSheet = new CSSStyleSheet()
document.adoptedStyleSheets.push(colorClassesSheet)

let theme = localStorage.getItem('theme') ?? AUTO
document.body.style.colorScheme = theme

let systemIsDark = darkThemeMq.matches
let themeIsDark = theme === AUTO ? systemIsDark : theme === DARK

const colors = {}
const listeners = []

const testContainer = document.querySelector('#colortest h2')

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
      let divGroup = document.querySelector(`#colortest .group-${group}`)
      if (divGroup === null) {
        divGroup = document.createElement('div')
        divGroup.className = `group-${group} flex-column`
        divGroup.title = varName
        testContainer.appendChild(divGroup)
      }

      let divColor = document.querySelector(`#colortest .bg-${name}`)
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

setColors(themeIsDark)

darkThemeMq.addListener((e) => {
  systemIsDark = e.matches
  if (
    document.body.style.colorScheme === 'light dark' ||
    document.body.style.colorScheme.length === 0
  ) {
    setColors(systemIsDark)
    listeners.forEach((listener) => {
      listener()
    })
  }
})

export const cssColors = colors

export const changeTheme = (theme) => {
  localStorage.setItem('theme', theme)
  document.body.style.colorScheme = theme
  themeIsDark = theme === 'light dark' ? systemIsDark : theme === 'dark'
  setColors(themeIsDark)
  listeners.forEach((listener) => {
    listener()
  })
}

export const addThemeChangeListener = (listener) => {
  listeners.push(listener)
}

export const rmvThemeChangeListener = (listener) => {
  for (let i = listeners.length - 1; i >= 0; i--) {
    if (Object.is(listeners[i], listener)) {
      listeners.splice(i, 1)
    }
  }
}
