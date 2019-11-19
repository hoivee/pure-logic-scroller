import { getTime } from '../utils'

interface ImpulseEvent {
  position: number
  timeStamp: number
}

class Impulse {
  eventList: ImpulseEvent[]
  tail: number
  length: number
  maxLength: number

  constructor (length: number) {
    this.eventList = []
    for (let i = 0; i < length; i++) {
      this.eventList.push({
        position: 0,
        timeStamp: 0
      })
    }
    this.tail = 0
    this.length = 0
    this.maxLength = length
  }

  push (position: number, timeStamp: number): number {
    const currentItem = this.eventList[this.tail]
    currentItem.position = position
    currentItem.timeStamp = timeStamp
    this.tail = (this.tail + 1) % this.maxLength
    if (this.length < this.maxLength) {
      this.length++
    }
    return this.length
  }

  getImpulse (): number {
    let impulse = 0
    const length = this.length

    if (length > 1) {
      const lastEvent = this.getItem(0)
      if (lastEvent === null) {
        return 0
      }
      if (getTime() - lastEvent.timeStamp < 34) {
        let startPos: number
        for (startPos = 1; startPos < length - 1; startPos++) {
          const event = this.getItem(startPos)
          if (event === null) {
            return 0
          }
          const pastTime = lastEvent.timeStamp - event.timeStamp
          if (pastTime > 100) {
            break
          }
        }
        const endPosItem = lastEvent
        const startPostItem = this.getItem(startPos)
        if (startPostItem === null) {
          return 0
        }
        impulse =
          (endPosItem.position - startPostItem.position) /
          (endPosItem.timeStamp - startPostItem.timeStamp)
      }
    }
    return impulse
  }

  // 按索引取得队列项，队尾索引值为0
  getItem (index: number): ImpulseEvent | null {
    if (index + 1 > this.length) {
      return null
    }
    const maxLength = this.maxLength
    const currentIndex = (this.tail - 1 - index + maxLength) % maxLength
    return this.eventList[currentIndex]
  }

  clear (): void {
    this.tail = 0
    this.length = 0
  }
}

export default Impulse
