import { LIGHT, DARK, AUTO, changeTheme } from '../cssColors.js'

const btnAuto = document.getElementById('schemeAuto')
if (btnAuto) {
  btnAuto.onclick = () => {
    changeTheme(AUTO)
  }
}
const btnLight = document.getElementById('schemeLight')
if (btnLight) {
  btnLight.onclick = () => {
    changeTheme(LIGHT)
  }
}
const btnDark = document.getElementById('schemeDark')
if (btnDark) {
  btnDark.onclick = () => {
    changeTheme(DARK)
  }
}

export class Settings {
  constructor() {}

  pageHandler(state) {
    console.log('page state in Settings')
  }
}
