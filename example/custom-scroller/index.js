import {ScrollerCore, RequestAnimationFrameRender} from '../../dist/index.es.js'

const MOVE_START_EVENT = ['touchstart', 'mousedown']
const MOVE_EVENT = ['touchmove', 'mousemove']
const MOVE_END_EVENT = ['touchend', 'mouseup']
const MOVE_CANCEL_EVENT = ['touchcancel', 'mouseup']

function setElementTranslate(contentStyle, transformProp, x, y) {
  contentStyle[transformProp] = `translate(${x}px, ${y}px)`
}

function standardizationEvent(event) {
  if (window.TouchEvent&&event instanceof TouchEvent) {
    event.clientX = event.changedTouches[0].clientX
    event.clientY = event.changedTouches[0].clientY
  }
}

class ScrollerDomHandler {
  constructor() {
    this.container = document.getElementById('container')
    this.content = document.getElementById('content')
    this.contentStyle = this.content.style
    this.containerRect = null
    this.contentRect = null
    this.transformProp = 'transform'
    this.events = [...MOVE_EVENT, ...MOVE_END_EVENT, ...MOVE_CANCEL_EVENT]
    this.scrollerX = null
    this.scrollerY = null
    this.handleEvent = (e) => {
      if (this.isPressDown && this.events.indexOf(e.type) === -1) {
        return
      }

      if (MOVE_EVENT.indexOf(e.type) !== -1) {
        this.handlePressMove(e)
      } else if (MOVE_START_EVENT.indexOf(e.type) !== -1) {
        this.handlePressStart(e)
      } else if (MOVE_END_EVENT.indexOf(e.type) !== -1) {
        this.handlePressEnd(e)
      } else if (MOVE_CANCEL_EVENT.indexOf(e.type) !== -1) {
        this.handlePressEnd(e)
      }
    }

    this.testTransformProp()
    this.computeRect()
    this.bindEvent()
    this.setScrollerCore()
  }

  setScrollerCore() {
    let x = 0, y = 0
    const moveContentX = (position) => {
      x = position
      setElementTranslate(this.contentStyle, this.transformProp, x, y)
    }
    const moveContentY = (position) => {
      y = position
      setElementTranslate(this.contentStyle, this.transformProp, x, y)
    }

    this.scrollerX = new ScrollerCore(
      this.containerRect.width,
      this.contentRect.width
    )
    this.scrollerX.useRender(new RequestAnimationFrameRender(moveContentX))

    this.scrollerY = new ScrollerCore(
      this.containerRect.height,
      this.contentRect.height
    )
    this.scrollerY.useRender(new RequestAnimationFrameRender(moveContentY))
  }

  /**
   * 测试浏览器支持的 css `transform` 属性名
   */
  testTransformProp() {
    if ('transform' in this.contentStyle) {
      return
    }

    const prefix = ['webkit', 'ms', 'moz', 'o']
    const prefixCount = prefix.length

    for (let index = 0; index < prefixCount; index++) {
      let transformProp = prefix[index] + 'Transform'
      if (transformProp in this.contentStyle) {
        this.transformProp = transformProp
        return
      }
    }
  }

  computeRect() {
    const containerStyle = getComputedStyle(this.container)
    let width =
      this.container.clientWidth -
      containerStyle.paddingLeft.replace('px', '') -
      containerStyle.paddingRight.replace('px', '')
    let height =
      this.container.clientHeight -
      containerStyle.paddingTop.replace('px', '') -
      containerStyle.paddingBottom.replace('px', '')
    this.containerRect = {
      width,
      height,
    }

    this.contentRect = this.content.getBoundingClientRect()
  }

  bindEvent() {
    this.events.forEach((event) => {
      document.addEventListener(event, this.handleEvent)
    })
    MOVE_START_EVENT.forEach((event) => {
      this.content.addEventListener(event, this.handleEvent)
    })
  }
  removeEvent () {
    this.events.forEach((event) => {
      document.removeEventListener(event, this.handleEvent)
    })
    MOVE_START_EVENT.forEach((event) => {
      this.content.removeEventListener(event, this.handleEvent)
    })
  }

  handleEvent(e) {
    if (this.events.indexOf(e.type) !== -1 && !this.isPressDown) {
      return
    }

    if (MOVE_START_EVENT.includes(e.type)) {
      this.handlePressStart(e)
    } else if (MOVE_EVENT.includes(e.type)) {
      this.handlePressMove(e)
    } else if (MOVE_END_EVENT.includes(e.type)) {
      this.handlePressEnd(e)
    } else if (MOVE_CANCEL_EVENT.includes(e.type)) {
      this.handlePressEnd(e)
    }
  }

  handlePressStart(e) {
    standardizationEvent(e)
    const timeStamp = Date.now()
    this.isPressDown = true
    this.scrollerY.pressStart(e.clientY, timeStamp)
    this.scrollerX.pressStart(e.clientX, timeStamp)
  }

  handlePressMove(e) {
    standardizationEvent(e)
    if (this.isPressDown) {
      const timeStamp = Date.now()
      this.scrollerY.pressMove(e.clientY, timeStamp)
      this.scrollerX.pressMove(e.clientX, timeStamp)
    }
  }

  handlePressEnd(e) {
    standardizationEvent(e)
    const timeStamp = Date.now()
    this.isPressDown = false
    this.scrollerY.pressEnd(e.clientY, timeStamp)
    this.scrollerX.pressEnd(e.clientX, timeStamp)
  }
}

export default ScrollerDomHandler
