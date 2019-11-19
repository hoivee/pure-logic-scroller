import ScrollerCore from '../../core'
import RAFMixer from './RAFMixer'
import { getTime } from '../../utils'

type EaseFn = (value: number) => number

const easeTest: EaseFn = function cubicOut (t) {
  return --t * t * t + 1
}

export class RequestAnimationFrameRender {
  private scrollerCore: ScrollerCore
  private positionStart: number
  private easeFn: EaseFn
  private positionChange: number
  private duration: number
  private startTimeStamp: number
  currentPosition: number
  step: (now: number) => void
  processing: boolean
  positionUpdateNotifyCallback: (position: number) => void

  constructor (positionUpdateNotifyCallback: (position: number) => void) {
    this.processing = false
    this.easeFn = easeTest
    this.positionStart = 0
    this.currentPosition = 0
    this.positionChange = 0
    this.duration = 0
    this.startTimeStamp = 0
    this.positionUpdateNotifyCallback = positionUpdateNotifyCallback
    this.step = (now) => {
      const pastTime = now - this.startTimeStamp

      let progress = pastTime / this.duration
      if (progress > 1) {
        progress = 1
      }

      this.currentPosition =
        this.easeFn(progress) * this.positionChange + this.positionStart

      if (pastTime > this.duration) {
        this.currentPosition = Math.round(this.currentPosition)
        this.processing = false
        this.scrollerCore.overTest()
      }
    }
  }

  install (scrollerCore: ScrollerCore): void {
    this.scrollerCore = scrollerCore
  }

  positionUpdateNotify (): void {
    this.positionUpdateNotifyCallback(this.currentPosition)
  }

  renderScrollTo (
    position: number,
    duration: number,
    easeFn = easeTest
  ): void {
    this.processing = true
    this.easeFn = easeFn
    this.duration = duration
    this.startTimeStamp = getTime()
    const currentPosition = this.positionStart = this.currentPosition
    this.positionChange = position - currentPosition

    RAFMixer.addStepItem(this)
  }

  stopScroll (): void {
    this.processing = false
  }
}

export default RequestAnimationFrameRender
