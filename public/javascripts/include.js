function log(sMsg) {
  var oCntr = document.getElementById('log')
  if (oCntr) {
    oCntr.innerHTML += '<br>' + sMsg
    oCntr.scrollTop = oCntr.scrollHeight
  }
}
