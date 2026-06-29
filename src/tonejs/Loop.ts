import { Bezier } from 'bezier-js'
import * as Tone from 'tone'
import { lerp, scaleToRange, rateToSeconds } from '../math'

type LoopCallback = (time: number, interval: number) => void

export default class Loop {
  rate: string
  interval: number
  swingAmt: number
  swingPhraseLength: number
  swingEnable: boolean
  callback: LoopCallback
  swingSkew: number
  swingIndex: number
  swingCurve: Bezier
  loop: Tone.Loop

  constructor(callback: LoopCallback) {
    this.rate = '4n'
    this.interval = rateToSeconds(this.rate, Tone.getTransport().bpm.value)
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

  curveY(x: number) {
    const intersect = this.swingCurve.intersects({ p1: { x, y: 0 }, p2: { x, y: 1 } }) as number[]
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

  updateSwingAmt(swingAmt: number) {
    this.swingAmt = swingAmt
    if (this.swingAmt === 0.5) {
      this.swingEnable = false
      this.loop.interval = this.interval
    } else {
      this.swingEnable = true
      this.loop.interval = this.interval * this.swingPhraseLength
    }
    // Always (re)start the loop after changing swing. Enabling swing used to only set
    // swingEnable + interval without restarting, so if the loop happened to be stopped
    // at that moment — which it is during a preset load (the loop is reset before the
    // channel's swing value is applied) — it would stay stopped forever and the whole
    // sequence/key would never play. This is why presets with swung channels (Duet,
    // Strolling, Jazz, …) had silent, non-advancing channels until a manual restart.
    this.loop.stop()
    this.loop.start(0)
    this.updateCurve()
  }

  updateSwingPhraseLength(swingPhraseLength: number) {
    this.swingPhraseLength = swingPhraseLength
    this.swingSkew = this.swingPhraseLength === 2 ? 0 : scaleToRange(this.swingPhraseLength, 3, 6, 0.25, 1)
    if (this.swingEnable) {
      this.loop.interval = this.interval * this.swingPhraseLength
    }
    this.updateCurve()
  }

  updateRate(rate: string) {
    this.rate = rate
    this.updateInterval()
  }

  updateTempo(tempo: number) {
    if (Tone.getTransport().bpm.value !== tempo) {
      Tone.getTransport().bpm.value = tempo
    }
    this.updateInterval()
  }

  updateInterval() {
    this.interval = rateToSeconds(this.rate, Tone.getTransport().bpm.value)
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
