import React, { useState, useCallback } from 'react'
import NumInput from './NumInput'
import logo from '../assets/logo.svg'
import play from '../assets/play.svg'
import stop from '../assets/stop.svg'
import './Transport.scss'

export default function Transport() {
  const [tempo, setTempo] = useState(120)
  const [playing, setPlaying] = useState(false)

  const playStop = useCallback(() => {
    setPlaying((playing) => !playing)
  }, [])

  return (
    <div id="transport">
      <img id="logo" src={logo} alt="Phase Machine" />
      <img id="play-stop" src={playing ? stop : play} alt="PLAY" onClick={playStop} />
      <NumInput value={tempo} setValue={setTempo} label="Tempo" />
    </div>
  )
}
