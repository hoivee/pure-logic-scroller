type RAF = (callback: FrameRequestCallback) => void
declare global {
  interface Window {
    msRequestAnimationFrame: RAF
    mozRequestAnimationFrame: RAF
    oRequestAnimationFrame: RAF
  }
}

const rAF: RAF =
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  function (callback): void {
    window.setTimeout(callback, 1000 / 60)
  }

const getTime =
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  Date.now ||
  function getTime (): number {
    return new Date().getTime()
  }

function getNumberSign (number: number): 0 | 1 | -1 {
  if (number > 0) {
    return 1
  } else if (number < 0) {
    return -1
  } else {
    return 0
  }
}

export {
  rAF,
  getTime,
  getNumberSign
}
