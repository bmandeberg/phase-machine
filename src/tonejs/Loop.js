import { Bezier } from 'bezier-js'
import regeneratorRuntime from 'regenerator-runtime'
import * as Tone from './Tone'
import { lerp } from '../math'

export default class Loop {
  constructor(callback) {
    this.rate = '4n'
    this.swingAmt = 0
    this.swingPhraseLength = 2
    this.callback = callback
    this.swingSkew = 0
    this.swingIndex = 0
    this.swingCurve = new Bezier(
      0,
      0,
      lerp(0, 1, this.swingAmt),
      lerp(1 - this.swingSkew * 0.5, this.swingSkew * 0.5, this.swingAmt),
      1,
      1
    )
    this.loop = new Tone.Loop((time) => {
      this.swingIndex = this.swingIndex === this.swingPhraseLength - 1 ? 0 : this.swingIndex + 1
      // this.loop.offset = this.swingTime() ?? this.loop.offset
      if (this.callback) this.callback(time)
    }, this.rate).start(0)
  }

  swingTime() {
    const step = this.swingIndex / this.swingPhraseLength
    const cy = this.curveY(step)
    return Tone.Transport.toSeconds(this.rate) * this.swingPhraseLength * (step - cy)
  }

  curveY(x) {
    const intersect = this.swingCurve.intersects({ p1: { x, y: 0 }, p2: { x, y: 1 } })
    if (!intersect.length) {
      return x
    }
    return this.swingCurve.get(intersect[0]).y
  }

  updateCurve(swingAmt, swingPhraseLength) {
    this.swingAmt = swingAmt
    this.swingPhraseLength = swingPhraseLength
    this.swingCurve.points[1] = {
      x: lerp(0, 1, this.swingAmt),
      y: lerp(1 - this.swingSkew * 0.5, this.swingSkew * 0.5, this.swingAmt),
    }
  }

  updateRate(rate) {
    this.rate = rate
    this.loop.interval = this.rate
  }
}
