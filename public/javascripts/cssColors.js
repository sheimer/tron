const styleObj = window.getComputedStyle(document.body)
const colors = {}

const setColors = (isDark) => {
  for (let i = 0; i < styleObj.length; i++) {
    if (styleObj[i].startsWith('--color-')) {
      const name = styleObj[i].replace('--color-', '')
      const colorArray = styleObj
        .getPropertyValue(styleObj[i])
        .replace(/^light-dark\(|\)$| /g, '')
        .split(',')
      colors[name] = colorArray[isDark ? 1 : 0]
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
  listeners.forEach((activeListener) => {
    console.log(Object.is(activeListener, listener))
  })
}
/*
  bg: style.getPropertyValue('--color-bg'),
fg: style.getPropertyValue('--color-fg'),
fgMuted: style.getPropertyValue('--color-fg-muted'),
rose: style.getPropertyValue('--color-rose'),
leaf: style.getPropertyValue('--color-leaf'),
wood: style.getPropertyValue('--color-wood'),
water: style.getPropertyValue('--color-water'),
blossom: style.getPropertyValue('--color-blossom'),
sky: style.getPropertyValue('--color-sky'),
  */
