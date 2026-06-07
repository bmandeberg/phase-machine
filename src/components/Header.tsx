import React from 'react'
import regeneratorRuntime from 'regenerator-runtime'
import * as Tone from 'tone'
import { VIEWS, SECTIONS, MAX_CHANNELS, ALT } from '../globals'
import { midiStartContinue, midiStop } from '../hooks/useMIDI'
import NumInput from './NumInput'
import RotaryKnob from './RotaryKnob'
import Dropdown from './Dropdown'
import Presets from './Presets'
import RadioButtons from './RadioButtons'
import { Preset } from '../types'
import logo from '../assets/logo.svg'
import logoDark from '../assets/logo-dark.svg'
import play from '../assets/play.svg'
import playDark from '../assets/play-dark.svg'
import stop from '../assets/stop.svg'
import waves from '../assets/waves.png'
import logoShadow from '../assets/48F8B2439E7D5A31.png'
import './Header.scss'

void regeneratorRuntime

/* eslint-disable @typescript-eslint/no-explicit-any */
interface HeaderProps {
  tempo: number
  setTempo: any
  playing?: boolean
  setPlaying: any
  midiOuts?: any[]
  midiOut?: string | null
  midiIns?: any[]
  midiIn?: string | null
  setMidiOut: any
  setMidiIn: any
  midiEnabled?: boolean
  numChannels: number
  setNumChannels: any
  view?: string
  setView: any
  scrollTo?: string
  setScrollTo: any
  channelSync?: boolean
  setChannelSync?: any
  presetOptions?: any[]
  preset: Preset
  setPresetName: any
  setPreset: any
  presetDirty?: boolean
  presetHotkey?: number | string | null
  savePreset: any
  newPreset: any
  deletePreset: any
  setModalType: any
  theme: string
  triggerTransportReset: any
  globalVolume: number
  setGlobalVolume: any
  grabbing?: boolean
  setGrabbing?: any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default class Header extends React.Component<HeaderProps> {
  initialized: boolean

  constructor(props: HeaderProps) {
    super(props)
    this.initialized = false
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  async playStop() {
    if (!this.initialized) {
      await Tone.start()
      this.initialized = true
    }
    if (ALT) {
      this.props.triggerTransportReset()
    } else {
      if (!this.props.playing) {
        Tone.getTransport().start()
        midiStartContinue(this.props.midiOut, this.props.midiIn)
      } else {
        Tone.getTransport().pause()
        midiStop(this.props.midiOut, this.props.midiIn)
      }
      this.props.setPlaying((playing: boolean) => !playing)
    }
  }

  handleKeyDown(e: KeyboardEvent) {
    if (
      !document.activeElement?.classList.contains('spacebar-ok') &&
      document.activeElement?.nodeName !== 'TEXTAREA'
    ) {
      if (e.key === ' ') {
        e.preventDefault()
        this.playStop()
      }
      if (this.props.view === 'horizontal') {
        switch (e.key) {
          case 'a':
            this.props.setScrollTo(SECTIONS[0])
            break
          case 's':
            this.props.setScrollTo(SECTIONS[1])
            break
          case 'd':
            this.props.setScrollTo(SECTIONS[2])
            break
          default:
        }
      }
    }
  }

  openSettings() {
    this.props.setModalType('settings')
  }

  openAbout() {
    this.props.setModalType('about')
  }

  render() {
    return (
      <div id="header">
        {this.props.theme !== 'light' && <img className="waves-background" src={waves} alt="" />}
        {this.props.theme !== 'light' && <img className="logo-shadow" src={logoShadow} alt="" />}
        <img id="logo" className="no-select" src={this.props.theme === 'dark' ? logoDark : logo} alt="Phase Machine" />
        <img
          id="play-stop"
          className="header-item no-select"
          src={this.props.playing ? stop : this.props.theme === 'dark' ? playDark : play}
          alt="PLAY"
          onClick={this.playStop.bind(this)}
          draggable="false"
        />
        <NumInput
          className="header-item"
          value={this.props.tempo}
          setValue={this.props.setTempo}
          label="Tempo"
          min={0}
          max={300}
          small
        />
        <NumInput
          className="header-item"
          value={this.props.numChannels}
          setValue={this.props.setNumChannels}
          label="Channels"
          min={0}
          max={MAX_CHANNELS}
          small
        />
        <Presets
          className="header-item"
          preset={this.props.preset}
          presetOptions={this.props.presetOptions}
          setPresetName={this.props.setPresetName}
          setPreset={this.props.setPreset}
          presetDirty={this.props.presetDirty}
          presetHotkey={this.props.presetHotkey}
          savePreset={this.props.savePreset}
          newPreset={this.props.newPreset}
          deletePreset={this.props.deletePreset}
          theme={this.props.theme}
        />
        <RadioButtons
          className="header-item view-buttons"
          label="View"
          options={VIEWS}
          selected={this.props.view}
          setSelected={this.props.setView}
        />
        <Dropdown
          className="header-item view-dropdown"
          label="View"
          options={VIEWS}
          setValue={this.props.setView}
          value={this.props.view}
          small
        />
        <Dropdown
          className="header-item midi-dropdown"
          label="MIDI Out"
          options={this.props.midiOuts ?? []}
          setValue={this.props.setMidiOut}
          value={this.props.midiOut}
          placeholder="No MIDI Out"
          noOptions="MIDI only works in Google Chrome"
          small
        />
        <Dropdown
          className="header-item midi-dropdown"
          label="MIDI In"
          options={this.props.midiIns ?? []}
          setValue={this.props.setMidiIn}
          value={this.props.midiIn}
          placeholder="No MIDI In"
          noOptions="MIDI only works in Google Chrome"
          small
        />
        {this.props.view === 'horizontal' && (
          <RadioButtons
            className="header-item scroll-to"
            label="Scroll To"
            options={SECTIONS}
            selected={this.props.scrollTo}
            setSelected={this.props.setScrollTo}
          />
        )}
        <RotaryKnob
          className="header-item global-volume"
          min={0}
          max={1}
          value={this.props.globalVolume}
          setValue={this.props.setGlobalVolume}
          label="Volume"
          setGrabbing={this.props.setGrabbing}
          grabbing={this.props.grabbing}
          inline={true}
          mute={false}
          theme={this.props.theme}
          headerStyle
        />
        <div className="header-aux">
          <div className="aux-item header-about" onClick={this.openAbout.bind(this)} title="About"></div>
          <div className="aux-item header-settings" onClick={this.openSettings.bind(this)} title="Settings"></div>
        </div>
      </div>
    )
  }
}
