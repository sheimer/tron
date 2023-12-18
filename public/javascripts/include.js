export function log(sMsg) {
  const oCntr = document.getElementById('log')
  if (oCntr) {
    oCntr.innerHTML += '<br>' + sMsg
    oCntr.scrollTop = oCntr.scrollHeight
  }
}

export function fisherYatesShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)) // random index
    ;[arr[i], arr[j]] = [arr[j], arr[i]] // swap
  }
  return arr
}
