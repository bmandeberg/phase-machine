import { Bezier } from 'bezier-js'
import * as Tone from 'tone'
import { lerp, scaleToRange } from '../math'

export default class Loop {
  constructor(callback) {
    this.rate = '4n'
    this.interval = Tone.Transport.toSeconds(this.rate)
    this.swingAmt = 0.5
    this.swingPhraseLength = 2
    this.swingEnable = false
    this.callback = callback
    this.swingSkew = 0
    this.swingIndex = 0
    this.swingCurve = new Bezier(
      0,
      0,
      lerp(0, 1, 1 - this.swingAmt),
      lerp(1 - this.swingSkew * 0.5, this.swingSkew * 0.5, 1 - this.swingAmt),
      1,
      1
    )
    this.loop = new Tone.Loop((time) => {
      if (this.swingEnable) {
        this.swingIndex = this.swingIndex >= this.swingPhraseLength - 1 ? 0 : this.swingIndex + 1
        this.loop.stop()
        this.loop.start(this.swingInterval())
      }
      if (this.callback) this.callback(time, this.interval)
    }, this.interval).start(0)
  }

  swingInterval() {
    const cy = this.curveY(this.swingIndex / this.swingPhraseLength)
    return cy * this.interval * this.swingPhraseLength
  }

  curveY(x) {
    const intersect = this.swingCurve.intersects({ p1: { x, y: 0 }, p2: { x, y: 1 } })
    if (!intersect.length) {
      return x
    }
    return this.swingCurve.get(intersect[0]).y
  }

  updateCurve() {
    this.swingCurve.points[1] = {
      x: lerp(0, 1, 1 - this.swingAmt),
      y: lerp(1 - this.swingSkew * 0.5, this.swingSkew * 0.5, 1 - this.swingAmt),
    }
  }

  updateSwingAmt(swingAmt) {
    this.swingAmt = swingAmt
    if (this.swingAmt === 0.5) {
      this.swingEnable = false
      this.loop.interval = this.interval
      this.loop.stop()
      this.loop.start(0)
    } else {
      this.swingEnable = true
      this.loop.interval = this.interval * this.swingPhraseLength
    }
    this.updateCurve()
  }

  updateSwingPhraseLength(swingPhraseLength) {
    this.swingPhraseLength = swingPhraseLength
    this.swingSkew = this.swingPhraseLength === 2 ? 0 : scaleToRange(this.swingPhraseLength, 3, 6, 0.25, 1)
    if (this.swingEnable) {
      this.loop.interval = this.interval * this.swingPhraseLength
    }
    this.updateCurve()
  }

  updateRate(rate) {
    this.rate = rate
    this.updateInterval()
  }

  updateTempo(tempo) {
    if (Tone.Transport.bpm.value !== tempo) {
      Tone.Transport.bpm.value = tempo
    }
    this.updateInterval()
  }

  updateInterval() {
    this.interval = Tone.Transport.toSeconds(this.rate)
    this.loop.interval = this.interval * (this.swingEnable ? this.swingPhraseLength : 1)
  }

  reset() {
    this.swingIndex = 0
    this.loop.stop()
    this.loop.start(0)
  }

  dispose() {
    this.loop.dispose()
  }
}
