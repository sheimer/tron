const openedContent = new Set()

const initDropdowns = () => {
  document.querySelectorAll('.dropdown').forEach((dropdown) => {
    dropdown.onclick = (evt) => {
      const content = dropdown.querySelector('.dropdown-content')

      if (content.contains(evt.target)) {
        return
      }

      const isClosed = content.style.display !== 'flex'
      content.style.display = isClosed ? 'flex' : 'none'
      if (isClosed) {
        openedContent.add(dropdown)
      } else {
        openedContent.delete(dropdown)
      }
    }
  })
}

document.addEventListener('DOMContentLoaded', initDropdowns, false)

document.onclick = (evt) => {
  const removeItems = []
  openedContent.forEach((dropdown) => {
    if (!dropdown.contains(evt.target)) {
      const content = dropdown.querySelector('.dropdown-content')
      content.style.display = 'none'
      removeItems.push(dropdown)
    }
  })
  removeItems.forEach((dropdown) => {
    openedContent.delete(dropdown)
  })
}
