/**
 * Pure Fisher-Yates array shuffle.
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export function fisherYatesShuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function getRandomInt(min, max) {
  const minCeil = Math.ceil(min)
  const maxFloor = Math.floor(max)
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil
}

/**
 * Generates ordinal suffix for numbers (1st, 2nd, 3rd, 4th, etc.).
 * @param {number} i
 * @returns {string}
 */
export function ordinalSuffixOf(i) {
  const j = i % 10
  const k = i % 100
  if (j === 1 && k !== 11) {
    return i + 'st'
  }
  if (j === 2 && k !== 12) {
    return i + 'nd'
  }
  if (j === 3 && k !== 13) {
    return i + 'rd'
  }
  return i + 'th'
}
