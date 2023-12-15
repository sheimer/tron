export function log(sMsg) {
  const oCntr = document.getElementById('log')
  if (oCntr) {
    oCntr.innerHTML += '<br>' + sMsg
    oCntr.scrollTop = oCntr.scrollHeight
  }
}
