import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import NumInput from './NumInput'
import Dropdn from './Dropdn'
import SplitButton from './SplitButton'
import RadioButtons from './RadioButtons'
import logo from '../assets/logo.svg'
import play from '../assets/play.svg'
import stop from '../assets/stop.svg'
import './Transport.scss'

const VIEWS = ['stacked', 'horizontal', 'grid']
const SECTIONS = ['key', 'piano roll', 'pitch set', 'sequencer']

export default function Transport(props) {
  const [playing, setPlaying] = useState(false)
  const [tempo, setTempo] = useState(120)
  const [numChannels, setNumChannels] = useState(4)
  const [view, setView] = useState(VIEWS[0])
  const [midiOut, setMidiOut] = useState(null)
  const [scrollTo, setScrollTo] = useState(SECTIONS[0])

  useEffect(() => {
    if (props.midiOutputs.length) {
      setMidiOut((midiOut) => (!midiOut ? props.midiOutputs[0] : null))
    }
  }, [props.midiOutputs])

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
      <SplitButton className="transport-item" label="Preset" />
      <Dropdn className="transport-item" label="View" options={VIEWS} setValue={setView} value={view} />
      <Dropdn
        className="transport-item"
        label="MIDI Out"
        options={props.midiOutputs}
        setValue={setMidiOut}
        value={midiOut}
        placeholder="No MIDI Out"
      />
      {view === 'horizontal' && (
        <RadioButtons
          className="transport-item"
          label="Scroll To"
          options={SECTIONS}
          selected={scrollTo}
          setSelected={setScrollTo}
        />
      )}
    </div>
  )
}
Transport.propTypes = {
  midiOutputs: PropTypes.array,
}
