import { useEffect, useRef } from 'react'
import Loop from './Loop'

export default function useLoop(callback, rate, tempo, swing, swingLength) {
  const loop = useRef()
  // init
  useEffect(() => {
    loop.current = new Loop(callback)
  }, [callback])
  // change rate
  useEffect(() => {
    loop.current.updateRate(rate)
  }, [rate])
  // change tempo
  useEffect(() => {
    loop.current.updateTempo(tempo)
  }, [tempo])
  // change swing
  useEffect(() => {
    loop.current.updateSwingAmt(swing)
  }, [swing])
  useEffect(() => {
    loop.current.updateSwingPhraseLength(swingLength)
  }, [swingLength])

  return loop
}
