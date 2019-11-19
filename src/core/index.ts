import Impulse from './Impulse'
import { getNumberSign } from '../utils'

type EaseFn = (value: number) => number
type VoidFn = () => void

interface ScrollerCoreConfig {
  offsetMultiplyForOverEdge: number // 超过边缘的位移倍增，通常小于1
  bounceTime: number // 回弹动画持续时间
  maxBounceOffsetMul: number // 回弹动画位移倍增
  maxBounceDurationMul: number // 回弹动画持续时间倍增
  minScrollDuration: number // 最小滚动时间
  impulseDurationMul: number // 势能滚动持续时间倍增
  impulseOffsetMul: number // 势能滚动持续时间倍增
}
interface ScrollerRender {
  currentPosition: number
  install: (scrollCore: ScrollerCore) => void
  renderScrollTo: (position: number, duration: number, easeFn?: EaseFn) => void
  stopScroll: () => void
  positionUpdateNotify: (position: number) => void
}

class ScrollerCore {
  contentLength: number
  containerLength: number
  private compare: number
  private offsetMultiply: number
  private lastMovePosition: number
  private scrollerRender: ScrollerRender
  private readonly impulseController: Impulse

  isOver: (
    position: number,
    leftCallback?: VoidFn,
    rightCallback?: VoidFn,
  ) => boolean

  rightCallback: VoidFn
  leftCallback: VoidFn
  overRangeCallback: VoidFn
  runOverAction: VoidFn
  overActionLeft: null | VoidFn | undefined
  overActionRight: null | VoidFn | undefined
  overTest: VoidFn
  config: ScrollerCoreConfig
  private userImpulse: number

  constructor (
    containerLength: number,
    contentLength: number,
    config: ScrollerCoreConfig = {
      bounceTime: 500,
      offsetMultiplyForOverEdge: 0.2,
      maxBounceOffsetMul: 0.06,
      maxBounceDurationMul: 3,
      minScrollDuration: 500,
      impulseDurationMul: 600,
      impulseOffsetMul: 300
    }
  ) {
    this.config = config
    this.impulseController = new Impulse(30)

    this.offsetMultiply = 1

    this.overTest = () => {
      const isOver = this.isOver(
        this.scrollerRender.currentPosition,
        this.leftCallback,
        this.rightCallback
      )
      if (isOver) {
        this.runOverAction()
      }
    }

    this.overRangeCallback = () => {
      this.offsetMultiply = this.config.offsetMultiplyForOverEdge
    }
    this.leftCallback = () => {
      this.scrollerRender.renderScrollTo(0, this.config.bounceTime)
    }
    this.rightCallback = () => {
      this.scrollerRender.renderScrollTo(this.compare, this.config.bounceTime)
    }

    this.runOverAction = () => {
      if (typeof this.overActionLeft === 'function') {
        this.overActionLeft()
        this.overActionLeft = null
      }
      if (typeof this.overActionRight === 'function') {
        this.overActionRight()
        this.overActionRight = null
      }
    }

    this.contentLength = 0
    this.containerLength = 0
    this.lastMovePosition = 0
    this.overActionLeft = null
    this.overActionRight = null

    this.init(containerLength, contentLength)
  }

  init (
    containerLength: number,
    contentLength: number
  ): void {
    this.contentLength = contentLength
    this.containerLength = containerLength

    const compare = (this.compare = containerLength - contentLength)
    if (compare < 0) {
      this.isOver = (position, leftCallback, rightCallback) => {
        if (position > 0) {
          this.overActionLeft = leftCallback
          return true
        } else if (position < compare) {
          this.overActionRight = rightCallback
          return true
        } else {
          return false
        }
      }
    } else {
      this.isOver = (position, leftCallback, rightCallback) => {
        if (position < 0) {
          this.overActionLeft = leftCallback
          return true
        } else if (position > compare) {
          this.overActionRight = rightCallback
          return true
        } else {
          return false
        }
      }
    }
  }

  scrollBy (positionChange: number, duration: number, easeFn?: EaseFn): void {
    const currentPosition = this.scrollerRender.currentPosition
    const targetPosition = currentPosition + positionChange
    this.scrollTo(targetPosition, duration, easeFn)
  }

  scrollTo (position: number, duration: number, easeFn?: EaseFn): void {
    const currentPosition = this.scrollerRender.currentPosition
    let targetPosition = position

    const positionChange = position - currentPosition
    if (this.isOver(currentPosition)) {
      this.overTest()
      return
    } else if (positionChange === 0) {
      return
    } else {
      const userImpulse = this.userImpulse
      let impulse
      // 限制最大冲量为1
      if (userImpulse > 0 && userImpulse <= 1) {
        impulse = userImpulse
      } else {
        impulse = 1
      }
      // 反弹距离由用户滚动冲量和反弹位移倍增值决定
      const MAX_BOUNCE_OFFSET = this.containerLength * this.config.maxBounceOffsetMul * getNumberSign(positionChange) * impulse
      // 重设用户滚动冲量
      this.userImpulse = 1
      const positionChangeTest = targetPosition + MAX_BOUNCE_OFFSET
      if (this.isOver(positionChangeTest)) {
        if (positionChange * getNumberSign(this.compare) < 0) {
          targetPosition = MAX_BOUNCE_OFFSET
        } else {
          targetPosition = this.compare + MAX_BOUNCE_OFFSET
        }
        duration =
          (duration / (positionChange / MAX_BOUNCE_OFFSET)) * this.config.maxBounceDurationMul
      }
    }
    // 最小滚动时间为500ms
    const MIN_DURATION = this.config.minScrollDuration
    const innerDuration = duration < MIN_DURATION ? MIN_DURATION : duration
    this.scrollerRender.renderScrollTo(targetPosition, innerDuration, easeFn)
  }

  scrollByImpulse (impulse: number): void {
    const DURATION_MUL = this.config.impulseDurationMul
    let duration = impulse * DURATION_MUL
    duration = Math.abs(duration)
    const IMPULSE_OFFSET_MUL = this.config.impulseOffsetMul
    const positionChange = IMPULSE_OFFSET_MUL * impulse
    this.userImpulse = impulse
    this.scrollBy(positionChange, duration)
  }

  addPosition (position: number): void {
    this.scrollerRender.stopScroll()
    this.offsetMultiply = 1
    const isOver = this.isOver(
      this.scrollerRender.currentPosition,
      this.overRangeCallback,
      this.overRangeCallback
    )
    if (isOver) {
      this.runOverAction()
    }

    let currentPosition = this.scrollerRender.currentPosition
    currentPosition = currentPosition + position * this.offsetMultiply
    this.scrollerRender.currentPosition = currentPosition
    this.scrollerRender.positionUpdateNotify(currentPosition)
  }

  pressStart (position: number): void {
    this.lastMovePosition = position
    this.scrollerRender.stopScroll()
  }

  pressMove (position: number, timeStamp: number): void {
    this.addPosition(position - this.lastMovePosition)
    this.lastMovePosition = position
    this.impulseController.push(position, timeStamp)
  }

  pressEnd (position: number, timeStamp: number): void {
    const impulseController = this.impulseController
    impulseController.push(position, timeStamp)
    const contentImpulse = impulseController.getImpulse()
    impulseController.clear()

    this.scrollByImpulse(contentImpulse)
  }

  useRender (render: ScrollerRender): void {
    this.scrollerRender = render
    render.install(this)
  }
}

export default ScrollerCore
