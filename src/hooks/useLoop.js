import { useEffect, useRef } from 'react'
import Loop from '../tonejs/Loop'

export default function useLoop(callback, rate, tempo, swing, swingLength) {
  const loop = useRef()
  // cleanup
  useEffect(() => {
    return () => {
      if (loop.current) {
        loop.current.dispose()
      }
    }
  }, [])
  // init
  useEffect(() => {
    if (!loop.current) {
      loop.current = new Loop(callback)
    } else {
      loop.current.callback = callback
    }
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
