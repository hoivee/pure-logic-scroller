import { getTime, rAF } from '../../utils'
import RequestAnimationFrameRender from './index'

type StepItem = RequestAnimationFrameRender

class RAFMixer {
  stepItems: StepItem[]
  preCount: number
  runSteps: () => void
  processStep: () => void

  constructor () {
    this.stepItems = []
    this.preCount = 0

    this.runSteps = () => {
      const now = getTime()
      const length = this.stepItems.length
      let stepCount = length
      for (let i = length - 1; i > -1; i--) {
        const stepItem = this.stepItems[i]
        if (stepItem.processing) {
          stepItem.step(now)
          stepItem.positionUpdateNotify()
        } else {
          this.stepItems.splice(i, 1)
          stepCount--
        }
      }

      if (stepCount > 0) {
        rAF(this.runSteps)
      }
    }
    this.processStep = () => {
      this.preCount--
      if (this.preCount === 0) {
        this.runSteps()
      }
    }
  }

  addStepItem (stepItem: StepItem): void {
    if (this.stepItems.indexOf(stepItem) === -1) {
      this.stepItems.push(stepItem)
      this.preCount++
      rAF(this.processStep)
    }
  }
}

export default new RAFMixer()
