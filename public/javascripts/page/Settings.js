import { LIGHT, DARK, AUTO, changeTheme } from '../cssColors.js'

const btnAuto = document.getElementById('scheme-auto')
if (btnAuto) {
  btnAuto.onclick = () => {
    changeTheme(AUTO)
  }
}
const btnLight = document.getElementById('scheme-light')
if (btnLight) {
  btnLight.onclick = () => {
    changeTheme(LIGHT)
  }
}
const btnDark = document.getElementById('scheme-dark')
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
