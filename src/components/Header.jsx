import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { VIEWS, SECTIONS } from '../globals'
import NumInput from './NumInput'
import Dropdn from './Dropdn'
import SplitButton from './SplitButton'
import RadioButtons from './RadioButtons'
import Checkbox from './Checkbox'
import logo from '../assets/logo.svg'
import play from '../assets/play.svg'
import stop from '../assets/stop.svg'
import './Header.scss'

export default function Header({
  tempo,
  setTempo,
  playing,
  setPlaying,
  midiOutputs,
  midiOut,
  setMidiOut,
  numChannels,
  setNumChannels,
  view,
  setView,
  scrollTo,
  setScrollTo,
  channelSync,
  setChannelSync,
}) {
  const playStop = useCallback(() => {
    setPlaying((playing) => !playing)
  }, [setPlaying])

  return (
    <div id="header">
      <img id="logo" src={logo} alt="Phase Machine" />
      <img id="play-stop" className="header-item" src={playing ? stop : play} alt="PLAY" onClick={playStop} />
      <NumInput className="header-item" value={tempo} setValue={setTempo} label="Tempo" min={0} max={200} step={1} />
      <NumInput
        className="header-item"
        value={numChannels}
        setValue={setNumChannels}
        label="Channels"
        min={0}
        max={4}
        step={1}
      />
      <SplitButton className="header-item" label="Preset" />
      <Dropdn className="header-item" label="View" options={VIEWS} setValue={setView} value={view} />
      <Dropdn
        className="header-item"
        label="MIDI Out"
        options={midiOutputs}
        setValue={setMidiOut}
        value={midiOut}
        placeholder="No MIDI Out"
      />
      {view === 'horizontal' && (
        <RadioButtons
          className="header-item"
          label="Scroll To"
          options={SECTIONS}
          selected={scrollTo}
          setSelected={setScrollTo}
        />
      )}
      <Checkbox checked={channelSync} setChecked={setChannelSync} label="Channel Sync" />
    </div>
  )
}
Header.propTypes = {
  tempo: PropTypes.number,
  setTempo: PropTypes.func,
  playing: PropTypes.bool,
  setPlaying: PropTypes.func,
  midiOutputs: PropTypes.array,
  midiOut: PropTypes.string,
  setMidiOut: PropTypes.func,
  numChannels: PropTypes.number,
  setNumChannels: PropTypes.func,
  VIEWS: PropTypes.array,
  view: PropTypes.string,
  setView: PropTypes.func,
  SECTIONS: PropTypes.array,
  scrollTo: PropTypes.string,
  setScrollTo: PropTypes.func,
  channelSync: PropTypes.bool,
  setChannelSync: PropTypes.bool,
}
