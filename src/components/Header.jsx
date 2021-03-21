import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import regeneratorRuntime from 'regenerator-runtime'
import * as Tone from 'tone'
import { VIEWS, SECTIONS, MAX_CHANNELS } from '../globals'
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
  const [initialized, setInitialized] = useState(false)
  const playStop = useCallback(async () => {
    if (!initialized) {
      await Tone.start()
      setInitialized(true)
    }
    if (!playing) {
      Tone.Transport.start()
    } else {
      Tone.Transport.pause()
    }
    setPlaying((playing) => !playing)
  }, [initialized, playing, setPlaying])

  return (
    <div id="header">
      <img id="logo" src={logo} alt="Phase Machine" />
      <img id="play-stop" className="header-item" src={playing ? stop : play} alt="PLAY" onClick={playStop} />
      <NumInput
        className="header-item small-input"
        value={tempo}
        setValue={setTempo}
        label="Tempo"
        min={0}
        max={200}
        small
      />
      <NumInput
        className="header-item small-input"
        value={numChannels}
        setValue={setNumChannels}
        label="Channels"
        min={1}
        max={MAX_CHANNELS}
        small
      />
      <SplitButton className="header-item" label="Preset" small />
      <Dropdn className="header-item" label="View" options={VIEWS} setValue={setView} value={view} small />
      <Dropdn
        className="header-item"
        label="MIDI Out"
        options={midiOutputs}
        setValue={setMidiOut}
        value={midiOut}
        placeholder="No MIDI Out"
        small
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
  setChannelSync: PropTypes.func,
}
