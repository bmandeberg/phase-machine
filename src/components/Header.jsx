import React from 'react'
import PropTypes from 'prop-types'
import regeneratorRuntime from 'regenerator-runtime'
import * as Tone from 'tone'
import { VIEWS, SECTIONS, MAX_CHANNELS } from '../globals'
import NumInput from './NumInput'
import Dropdn from './Dropdn'
import Presets from './Presets'
import RadioButtons from './RadioButtons'
import Checkbox from './Checkbox'
import logo from '../assets/logo.svg'
import play from '../assets/play.svg'
import stop from '../assets/stop.svg'
import './Header.scss'

export default class Header extends React.Component {
  constructor(props) {
    super(props)
    this.initialized = false
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this))
  }

  async playStop() {
    if (!this.initialized) {
      await Tone.start()
      this.initialized = true
    }
    if (!this.props.playing) {
      Tone.Transport.start()
    } else {
      Tone.Transport.pause()
    }
    this.props.setPlaying((playing) => !playing)
  }

  handleKeyDown(e) {
    if (e.key === ' ' && document.activeElement.getAttribute('type') !== 'text') {
      e.preventDefault()
      this.playStop()
    }
  }

  render() {
    return (
      <div id="header">
        <img id="logo" src={logo} alt="Phase Machine" />
        <img
          id="play-stop"
          className="header-item"
          src={this.props.playing ? stop : play}
          alt="PLAY"
          onClick={this.playStop.bind(this)}
        />
        <NumInput
          className="header-item small-input"
          value={this.props.tempo}
          setValue={this.props.setTempo}
          label="Tempo"
          min={0}
          max={300}
          small
        />
        <NumInput
          className="header-item small-input"
          value={this.props.numChannels}
          setValue={this.props.setNumChannels}
          label="Channels"
          min={0}
          max={MAX_CHANNELS}
          small
        />
        <Presets
          className="header-item"
          presetName={this.props.presetName}
          presetNames={this.props.presetNames}
          setPresetName={this.props.setPresetName}
          setPreset={this.props.setPreset}
          presetDirty={this.props.presetDirty}
          presetHotkey={this.props.presetHotkey}
        />
        <Dropdn
          className="header-item"
          label="View"
          options={VIEWS}
          setValue={this.props.setView}
          value={this.props.view}
          small
        />
        <Dropdn
          className="header-item"
          label="MIDI Out"
          options={this.props.midiOuts}
          setValue={this.props.setMidiOut}
          value={this.props.midiOut}
          placeholder="No MIDI Out"
          small
        />
        {this.props.view === 'horizontal' && (
          <RadioButtons
            className="header-item"
            label="Scroll To"
            options={SECTIONS}
            selected={this.props.scrollTo}
            setSelected={this.props.setScrollTo}
          />
        )}
        {/* <Checkbox checked={this.props.channelSync} setChecked={this.props.setChannelSync} label="Channel Sync" /> */}
      </div>
    )
  }
}
Header.propTypes = {
  tempo: PropTypes.number,
  setTempo: PropTypes.func,
  playing: PropTypes.bool,
  setPlaying: PropTypes.func,
  midiOuts: PropTypes.array,
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
  presetNames: PropTypes.array,
  presetName: PropTypes.string,
  setPresetName: PropTypes.func,
  setPreset: PropTypes.func,
  presetDirty: PropTypes.bool,
  presetHotkey: PropTypes.number,
}
