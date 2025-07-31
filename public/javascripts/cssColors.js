const colorClassesSheet = new CSSStyleSheet()

document.adoptedStyleSheets.push(colorClassesSheet)

const styleObj = window.getComputedStyle(document.body)
const colors = {}

const setColors = (isDark) => {
  colorClassesSheet.replaceSync('')
  for (let i = 0; i < styleObj.length; i++) {
    if (styleObj[i].startsWith('--color-')) {
      const name = styleObj[i].replace('--color-', '')
      const colorArray = styleObj
        .getPropertyValue(styleObj[i])
        .replace(/^light-dark\(|\)$| /g, '')
        .split(',')
      colors[name] = colorArray[isDark ? 1 : 0]
      colorClassesSheet.insertRule(
        `.fg-${name} { color: ${colorArray[isDark ? 1 : 0]};}`,
      )
      colorClassesSheet.insertRule(
        `.bg-${name} { background-color: ${colorArray[isDark ? 1 : 0]};}`,
      )
    }
  }
}

const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
let isDark = darkThemeMq.matches

setColors(isDark)

darkThemeMq.addListener((e) => {
  isDark = e.matches
  setColors(isDark)
  listeners.forEach((listener) => {
    listener()
  })
})

export const cssColors = colors

const listeners = []

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
