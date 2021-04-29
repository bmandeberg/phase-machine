import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import regeneratorRuntime from 'regenerator-runtime'
import * as Tone from 'tone'
import WebMidi from 'webmidi'
import classNames from 'classnames'
import { CSSTransition } from 'react-transition-group'
import { VIEWS, SECTIONS, DEFAULT_PRESET } from './globals'
import Header from './components/Header'
import Channel from './components/Channel'
import Modal from './components/Modal'
import usePresets from './hooks/usePresets'

const CLOCK_WIDTH = 658

// load/set presets
if (!window.localStorage.getItem('presets')) {
  window.localStorage.setItem('presets', JSON.stringify([DEFAULT_PRESET]))
  window.localStorage.setItem('activePreset', DEFAULT_PRESET.id)
}

export default function App() {
  const [presets, setPresets] = useState(JSON.parse(window.localStorage.getItem('presets')))
  const [currentPreset, setCurrentPreset] = useState(
    window.localStorage.getItem('activePreset')
      ? presets.find((p) => p.id === window.localStorage.getItem('activePreset'))
      : presets[presets.length - 1] || DEFAULT_PRESET
  )
  const [uiState, setUIState] = useState(deepStateCopy(currentPreset))

  const [tempo, setTempo] = useState(120)
  const [playing, setPlaying] = useState(false)
  const [numChannels, setNumChannels] = useState(1)
  const [view, setView] = useState(VIEWS[0])
  const [midiOut, setMidiOut] = useState(null)
  const [midiOuts, setMidiOuts] = useState([])
  const [scrollTo, setScrollTo] = useState(SECTIONS[0])
  const [channelSync, setChannelSync] = useState(false)

  const [modalType, setModalType] = useState('')

  const [grabbing, setGrabbing] = useState(false)
  const [resizing, setResizing] = useState(false)
  const keydownTimer = useRef(null)

  const container = useRef()
  const viewRef = useRef()

  // settings
  const [showStepNumbers, setShowStepNumbers] = useState(
    JSON.parse(window.localStorage.getItem('showStepNumbers')) || false
  )
  const [separateMIDIChannels, setSeparateMIDIChannels] = useState(
    JSON.parse(window.localStorage.getItem('separateMIDIChannels')) || true
  )

  useEffect(() => {
    window.localStorage.setItem('showStepNumbers', showStepNumbers)
  }, [showStepNumbers])

  useEffect(() => {
    window.localStorage.setItem('separateMIDIChannels', separateMIDIChannels)
  }, [separateMIDIChannels])

  // init MIDI

  useEffect(() => {
    function connectMidi() {
      setMidiOuts(WebMidi.outputs.map((o) => o.name))
      setMidiOut((midiOut) => midiOut ?? WebMidi.outputs[0].name)
    }
    function disconnectMidi(e) {
      setMidiOuts(WebMidi.outputs.map((o) => o.name))
      setMidiOut((midiOut) => {
        if (e.port.name === midiOut) {
          return WebMidi.outputs[0] ? WebMidi.outputs[0].name : null
        } else return midiOut
      })
    }
    WebMidi.enable((err) => {
      if (err) {
        alert('Unable to enable Web MIDI 😢')
      } else {
        WebMidi.addListener('connected', connectMidi)
        WebMidi.addListener('disconnected', disconnectMidi)
      }
    })
    viewRef.current = VIEWS[0]
    const containerEl = container.current
    function handleScroll() {
      if (viewRef.current === 'horizontal') {
        const scrollPositions = [
          0,
          document.querySelector('.piano').offsetLeft - 43,
          document.querySelector('.sequencer').offsetLeft - 59,
        ]
        let scrollEl = 0
        for (let i = 0; i < SECTIONS.length; i++) {
          if (containerEl.scrollLeft >= scrollPositions[i]) {
            scrollEl = i
          }
        }
        setScrollTo(SECTIONS[scrollEl])
      }
    }
    containerEl.addEventListener('scroll', handleScroll)
    return () => {
      containerEl.removeEventListener('scroll', handleScroll)
      WebMidi.removeListener('connected', connectMidi)
      WebMidi.removeListener('disconnected', disconnectMidi)
    }
  }, [])

  const updateView = useCallback((view) => {
    viewRef.current = view
    if (view === 'horizontal') {
      setScrollTo(SECTIONS[0])
    }
    setView(view)
  }, [])

  const doScroll = useCallback((scrollEl) => {
    const scrollPositions = [
      0,
      document.querySelector('.piano').offsetLeft - 43,
      document.querySelector('.sequencer').offsetLeft - 59,
    ]
    const scrollElIndex = SECTIONS.indexOf(scrollEl)
    if (scrollElIndex !== -1) {
      container.current.scroll({
        left: scrollPositions[scrollElIndex],
        behavior: 'smooth',
      })
    }
  }, [])

  useEffect(() => {
    container.current.scroll({
      left: 0,
    })
  }, [view])

  useEffect(() => {
    if (Tone.Transport.bpm.value !== tempo) {
      Tone.Transport.bpm.value = tempo
    }
  }, [tempo])

  const numChannelsSoloed = useMemo(() => uiState.channels.reduce((acc, curr) => acc + (curr.solo ? 1 : 0), 0), [
    uiState,
  ])

  const { setChannelState, setPresetName, presetDirty, setPreset, savePreset, newPreset, deletePreset } = usePresets(
    setUIState,
    numChannels,
    tempo,
    channelSync,
    uiState,
    currentPreset,
    presets,
    setCurrentPreset,
    deepStateCopy,
    setTempo,
    setNumChannels,
    setChannelSync,
    setPresets,
    keydownTimer
  )

  // render UI

  const channels = useMemo(
    () =>
      [...Array(numChannels)].map((d, i) => (
        <Channel
          numChannels={numChannels}
          key={i}
          channelNum={i}
          setGrabbing={setGrabbing}
          grabbing={grabbing}
          resizing={resizing}
          setResizing={setResizing}
          view={view}
          numChannelsSoloed={numChannelsSoloed}
          tempo={tempo}
          playing={playing}
          showStepNumbers={showStepNumbers}
          separateMIDIChannels={separateMIDIChannels}
          midiOut={midiOut}
          setChannelState={setChannelState}
          channelPreset={currentPreset.channels[i]}
        />
      )),
    [
      currentPreset.channels,
      grabbing,
      midiOut,
      numChannels,
      numChannelsSoloed,
      playing,
      resizing,
      separateMIDIChannels,
      setChannelState,
      showStepNumbers,
      tempo,
      view,
    ]
  )

  return (
    <div
      id="container"
      ref={container}
      className={classNames({ grabbing, resizing })}
      style={{
        minWidth:
          view === 'clock' && numChannels > 0
            ? CLOCK_WIDTH * Math.max(Math.floor(window.innerWidth / CLOCK_WIDTH), 2)
            : null,
      }}>
      <Header
        tempo={tempo}
        setTempo={setTempo}
        playing={playing}
        setPlaying={setPlaying}
        midiOuts={midiOuts}
        midiOut={midiOut}
        setMidiOut={setMidiOut}
        numChannels={numChannels}
        setNumChannels={setNumChannels}
        view={view}
        setView={updateView}
        scrollTo={scrollTo}
        setScrollTo={doScroll}
        channelSync={channelSync}
        setChannelSync={setChannelSync}
        preset={uiState}
        setPresetName={setPresetName}
        presetOptions={presets.map((p) => ({ label: p.name, value: p.id }))}
        setPreset={setPreset}
        presetDirty={presetDirty}
        presetHotkey={currentPreset.hotkey}
        savePreset={savePreset}
        newPreset={newPreset}
        deletePreset={deletePreset}
        setModalType={setModalType}
      />
      <div id="header-border"></div>
      <div id="channels" className={classNames({ empty: numChannels === 0 })}>
        {channels}
        {numChannels === 0 && (
          <div className="no-channels">
            <p>😴</p>
            <p>no channels</p>
          </div>
        )}
      </div>
      <CSSTransition in={!!modalType} timeout={300} classNames="show">
        <Modal
          modalType={modalType}
          setModalType={setModalType}
          showStepNumbers={showStepNumbers}
          setShowStepNumbers={setShowStepNumbers}
          separateMIDIChannels={separateMIDIChannels}
          setSeparateMIDIChannels={setSeparateMIDIChannels}
        />
      </CSSTransition>
    </div>
  )
}

function deepStateCopy(state) {
  return Object.assign({}, state, {
    channels: state.channels.map((c) => Object.assign({}, c, { key: c.key.slice(), seqSteps: c.seqSteps.slice() })),
  })
}
