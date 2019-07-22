export const getOffsetTopLeft = function(selector: string) {
  /* eslint-disable-next-line */
  const elem = document.querySelector<HTMLElement>(selector)
  if (!elem) {
    throw new Error(`找不到：${selector}`)
  }

  return {
    offsetLeft: elem.offsetLeft,
    offsetTop: elem.offsetTop
  }
}
