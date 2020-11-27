import React, { useState, useEffect, useCallback } from 'react'
import NumInput from './NumInput'
import Dropdn from './Dropdn'
import logo from '../assets/logo.svg'
import play from '../assets/play.svg'
import stop from '../assets/stop.svg'
import './Transport.scss'

const VIEW_OPTIONS = ['stacked', 'horizontal', 'grid']

export default function Transport() {
  const [playing, setPlaying] = useState(false)
  const [tempo, setTempo] = useState(120)
  const [numChannels, setNumChannels] = useState(4)
  const [view, setView] = useState(VIEW_OPTIONS[0])

  const playStop = useCallback(() => {
    setPlaying((playing) => !playing)
  }, [])

  return (
    <div id="transport">
      <img id="logo" src={logo} alt="Phase Machine" />
      <img id="play-stop" className="transport-item" src={playing ? stop : play} alt="PLAY" onClick={playStop} />
      <NumInput className="transport-item" value={tempo} setValue={setTempo} label="Tempo" min={0} max={200} step={1} />
      <NumInput
        className="transport-item"
        value={numChannels}
        setValue={setNumChannels}
        label="Channels"
        min={0}
        max={4}
        step={1}
      />
      <Dropdn className="transport-item" label="View" options={VIEW_OPTIONS} setValue={setView} value={view} />
    </div>
  )
}
