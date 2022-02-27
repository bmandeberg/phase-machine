import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import * as Tone from 'tone'
import WebMidi from 'webmidi'
import classNames from 'classnames'
import { CSSTransition } from 'react-transition-group'
import { v4 as uuid } from 'uuid'
import arrayMove from 'array-move'
import {
  MAX_CHANNELS,
  VIEWS,
  SECTIONS,
  DEFAULT_PRESET,
  DEFAULT_PRESETS,
  BLANK_CHANNEL,
  CHANNEL_COLORS,
  INSTRUMENT_TYPES,
  SIGNAL_TYPES,
} from './globals'
import Header from './components/Header'
import Channel from './components/Channel'
import Modal from './components/Modal'
import usePresets from './hooks/usePresets'
import './dark-theme.scss'
import './contrast-theme.scss'

// load/set presets
if (!window.localStorage.getItem('presets')) {
  window.localStorage.setItem('presets', DEFAULT_PRESETS)
  const defaultPresets = JSON.parse(DEFAULT_PRESETS)
  window.localStorage.setItem('activePreset', defaultPresets[0].id)
}

const PIANO_SCROLL = 60
const SEQ_SCROLL = 76

export default function App() {
  const [presets, setPresets] = useState(initializePresets)
  const [currentPreset, setCurrentPreset] = useState(initialPreset)
  const [uiState, setUIState] = useState(initializeUiState)

  const [tempo, setTempo] = useState(JSON.parse(window.localStorage.getItem('tempo')) ?? 120)
  const [playing, setPlaying] = useState(false)
  const [numChannels, setNumChannels] = useState(uiState.numChannels)
  const [view, setView] = useState(window.localStorage.getItem('view') ?? VIEWS[0])
  const viewRef = useRef()
  viewRef.current = view

  const [midiEnabled, setMidiEnabled] = useState(false)
  const [midiOut, setMidiOut] = useState(null)
  const midiOutRef = useRef()
  const [midiOuts, setMidiOuts] = useState([])
  const [midiIn, setMidiIn] = useState(null)
  const midiInRef = useRef()
  const [midiIns, setMidiIns] = useState([])
  const [midiNoteOn, setMidiNoteOn] = useState(null)
  const [midiNoteOff, setMidiNoteOff] = useState(null)

  const [restartChannels, setRestartChannels] = useState(true)
  const [scrollTo, setScrollTo] = useState(SECTIONS[0])
  const [channelSync, setChannelSync] = useState(uiState.channelSync)

  const [modalType, setModalType] = useState('')
  const [modalContent, setModalContent] = useState(false)
  const showModal = useCallback(() => {
    setModalContent(true)
  }, [])
  const hideModal = useCallback(() => {
    setModalContent(false)
  }, [])

  const [grabbing, setGrabbing] = useState(false)
  const [resizing, setResizing] = useState(false)
  const keydownTimer = useRef(null)

  const [resetTransport, setResetTransport] = useState(false)
  useEffect(() => {
    if (resetTransport) {
      Tone.Transport.stop()
      if (playing) {
        Tone.Transport.start()
      }
      setResetTransport(false)
    }
  }, [playing, resetTransport])
  const triggerTransportReset = useCallback(() => {
    setResetTransport(true)
  }, [])

  const [preventUpdate, setPreventUpdate] = useState()
  useEffect(() => {
    if (preventUpdate) {
      setPreventUpdate(false)
    }
  }, [preventUpdate])

  const container = useRef()

  // settings

  const [showStepNumbers, setShowStepNumbers] = useState(
    JSON.parse(window.localStorage.getItem('showStepNumbers')) ?? false
  )

  const [linearKnobs, setLinearKnobs] = useState(JSON.parse(window.localStorage.getItem('linearKnobs')) ?? true)

  const [theme, setTheme] = useState(window.localStorage.getItem('theme') ?? 'dark')

  const [defaultChannelModeKeybd, setDefaultChannelModeKeybd] = useState(
    JSON.parse(window.localStorage.getItem('defaultChannelModeKeybd')) ?? false
  )

  const [presetsRestartTransport, setPresetsRestartTransport] = useState(
    JSON.parse(window.localStorage.getItem('presetsRestartTransport')) ?? true
  )

  useEffect(() => {
    window.localStorage.setItem('showStepNumbers', showStepNumbers)
  }, [showStepNumbers])

  useEffect(() => {
    window.localStorage.setItem('linearKnobs', linearKnobs)
  }, [linearKnobs])

  useEffect(() => {
    window.localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem('defaultChannelModeKeybd', defaultChannelModeKeybd)
  }, [defaultChannelModeKeybd])

  useEffect(() => {
    window.localStorage.setItem('presetsRestartTransport', presetsRestartTransport)
  }, [presetsRestartTransport])

  useEffect(() => {
    if (WebMidi.enabled) {
      window.localStorage.setItem('midiIn', midiIn)
    }
  }, [midiIn])

  useEffect(() => {
    if (WebMidi.enabled) {
      window.localStorage.setItem('midiOut', midiOut)
    }
  }, [midiOut])

  useEffect(() => {
    window.localStorage.setItem('view', view)
    setTimeout(() => {
      document.activeElement.blur()
    }, 500)
  }, [view])

  // init scrolling

  useEffect(() => {
    const containerEl = container.current
    function handleScroll() {
      if (viewRef.current === 'horizontal') {
        const scrollPositions = [
          0,
          document.querySelector('.piano').offsetLeft - PIANO_SCROLL,
          document.querySelector('.sequencer').offsetLeft - SEQ_SCROLL,
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
    }
  }, [])

  // init MIDI

  useEffect(() => {
    function connectMidi() {
      const midiOuts = WebMidi.outputs.map((o) => o.name).concat(['(None)'])
      setMidiOuts(midiOuts)
      let mo
      setMidiOut(() => {
        const midiOut = window.localStorage.getItem('midiOut')
        if (midiOut && midiOuts.includes(midiOut)) {
          mo = midiOut
          return midiOut
        } else return null
      })
      const midiIns = WebMidi.inputs.map((i) => i.name).concat(['(None)'])
      setMidiIns(WebMidi.inputs.map((i) => i.name).concat(['(None)']))
      const mi = window.localStorage.getItem('midiIn')
      setMidiIn(
        () =>
          (midiIns.includes(mi) && mi !== mo && mi) || (WebMidi.inputs[0].name !== mo && WebMidi.inputs[0].name) || null
      )
    }
    function disconnectMidi(e) {
      setMidiOuts(WebMidi.outputs.map((o) => o.name))
      setMidiOut((midiOut) => {
        if (e.port.name === midiOut) {
          return WebMidi.outputs[0] ? WebMidi.outputs[0].name : null
        } else return midiOut
      })
      setMidiIns(WebMidi.inputs.map((i) => i.name))
      midiInRef.current = null
      setMidiIn((midiIn) => {
        if (e.port.name === midiIn) {
          return null
        } else return midiIn
      })
    }
    WebMidi.enable((err) => {
      if (err) {
        console.log(err)
      } else {
        setMidiEnabled(true)
        WebMidi.addListener('connected', connectMidi)
        WebMidi.addListener('disconnected', disconnectMidi)
      }
    })
    return () => {
      WebMidi.removeListener('connected', connectMidi)
      WebMidi.removeListener('disconnected', disconnectMidi)
    }
  }, [])

  // update MIDI ins and outs

  useEffect(() => {
    if (midiInRef.current) {
      midiInRef.current.removeListener()
    }
    if (midiIn) {
      if (midiIn === midiOutRef.current) {
        alert('Setting MIDI input to current MIDI output - avoiding circular MIDI messages, and disabling MIDI output!')
        setMidiOut(null)
        midiOutRef.current = null
      }
      midiInRef.current = WebMidi.getInputByName(midiIn)
      midiInRef.current.addListener('noteon', 'all', (e) => {
        setMidiNoteOn(e)
      })
      midiInRef.current.addListener('noteoff', 'all', (e) => {
        setMidiNoteOff(e)
      })
      midiInRef.current.addListener('start', 'all', (e) => {
        Tone.Transport.start()
        setPlaying(true)
      })
      midiInRef.current.addListener('continue', 'all', (e) => {
        Tone.Transport.start()
        setPlaying(true)
      })
      midiInRef.current.addListener('stop', 'all', (e) => {
        Tone.Transport.pause()
        setPlaying(false)
      })
      midiInRef.current.addListener('songposition', 'all', (e) => {
        if (e.data && e.data[0] === 242 && e.data[1] === 0) {
          setResetTransport(true)
        }
      })
    } else {
      midiInRef.current = null
    }
  }, [midiIn])

  useEffect(() => {
    if (midiOut && midiInRef.current && midiOut === midiInRef.current.name) {
      alert('Setting MIDI output to current MIDI input - avoiding circular MIDI messages, and disabling MIDI input!')
      setMidiIn(null)
    }
    midiOutRef.current = midiOut
  }, [midiOut])

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
      document.querySelector('.piano').offsetLeft - PIANO_SCROLL,
      document.querySelector('.sequencer').offsetLeft - SEQ_SCROLL,
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
    window.localStorage.setItem('tempo', tempo)
  }, [tempo])

  const numChannelsSoloed = useMemo(
    () => uiState.channels.reduce((acc, curr) => acc + (curr.solo ? 1 : 0), 0),
    [uiState]
  )

  const { setChannelState, setPresetName, presetDirty, setPreset, savePreset, newPreset, deletePreset, importPresets } =
    usePresets(
      setUIState,
      channelSync,
      uiState,
      currentPreset,
      presets,
      setCurrentPreset,
      deepStateCopy,
      setNumChannels,
      setChannelSync,
      setPresets,
      keydownTimer,
      setRestartChannels,
      presetsRestartTransport,
      playing
    )

  // channel management

  const getChannelColor = useCallback((channels) => {
    const nextColor = CHANNEL_COLORS.find((color) => !channels.map((c) => c.color).includes(color))
    return nextColor || CHANNEL_COLORS[0]
  }, [])

  useEffect(() => {
    setUIState((uiState) => {
      const uiStateCopy = Object.assign({}, uiState, { numChannels })
      const currentChannelsLength = uiStateCopy.channels.length
      if (numChannels > currentChannelsLength) {
        for (let i = 0; i < numChannels - currentChannelsLength; i++) {
          uiStateCopy.channels.push(
            BLANK_CHANNEL(uiStateCopy.channels.length, getChannelColor(uiStateCopy.channels), !defaultChannelModeKeybd)
          )
        }
      } else {
        uiStateCopy.channels = uiStateCopy.channels.slice(0, numChannels)
        uiStateCopy.channels.forEach((channel, i) => {
          channel.channelNum = i
        })
      }
      return uiStateCopy
    })
  }, [defaultChannelModeKeybd, getChannelColor, numChannels, setUIState])

  const duplicateChannel = useCallback(
    (id) => {
      if (uiState.channels.length < MAX_CHANNELS) {
        setUIState((uiState) => {
          const uiStateCopy = deepStateCopy(uiState)
          const channelNum = uiStateCopy.channels.find((c) => c.id === id).channelNum
          const duplicatedChannel = Object.assign({}, channelCopy(uiStateCopy.channels[channelNum]), {
            id: uuid(),
            channelNum: channelNum + 1,
            color: getChannelColor(uiStateCopy.channels),
          })
          uiStateCopy.channels.splice(channelNum + 1, 0, duplicatedChannel)
          uiStateCopy.channels.forEach((channel, i) => {
            channel.channelNum = i
          })
          return uiStateCopy
        })
        setNumChannels((numChannels) => numChannels + 1)
        setPreventUpdate(true)
      }
    },
    [getChannelColor, uiState.channels.length]
  )

  const deleteChannel = useCallback((id) => {
    setUIState((uiState) => {
      const uiStateCopy = deepStateCopy(uiState)
      const channelNum = uiStateCopy.channels.find((c) => c.id === id).channelNum
      uiStateCopy.channels.splice(channelNum, 1)
      uiStateCopy.channels.forEach((channel, i) => {
        channel.channelNum = i
      })
      return uiStateCopy
    })
    setNumChannels((numChannels) => numChannels - 1)
    setPreventUpdate(true)
  }, [])

  const changeChannelOrder = useCallback((channelNum, newChannelNum) => {
    setUIState((uiState) => {
      const uiStateCopy = deepStateCopy(uiState)
      uiStateCopy.channels = arrayMove(uiStateCopy.channels, channelNum, newChannelNum)
      uiStateCopy.channels.forEach((channel, i) => {
        channel.channelNum = i
      })
      return uiStateCopy
    })
    setPreventUpdate(true)
  }, [])

  // render UI

  const channels = useMemo(
    () =>
      uiState.channels.map((d, i) => (
        <Channel
          numChannels={numChannels}
          key={d.id}
          color={d.color}
          channelNum={d.channelNum}
          setGrabbing={setGrabbing}
          grabbing={grabbing}
          resizing={resizing}
          setResizing={setResizing}
          view={view}
          numChannelsSoloed={numChannelsSoloed}
          tempo={tempo}
          playing={playing}
          showStepNumbers={showStepNumbers}
          linearKnobs={linearKnobs}
          midiOut={midiOut}
          setChannelState={setChannelState}
          channelPreset={currentPreset.channels[i]}
          duplicateChannel={duplicateChannel}
          deleteChannel={deleteChannel}
          initState={d}
          container={container}
          changeChannelOrder={changeChannelOrder}
          theme={theme}
          midiNoteOn={midiNoteOn}
          midiNoteOff={midiNoteOff}
          defaultChannelModeKeybd={defaultChannelModeKeybd}
          restartChannels={restartChannels}
          resetTransport={resetTransport}
          preventUpdate={preventUpdate}
        />
      )),
    [
      changeChannelOrder,
      currentPreset.channels,
      defaultChannelModeKeybd,
      deleteChannel,
      duplicateChannel,
      grabbing,
      linearKnobs,
      midiNoteOff,
      midiNoteOn,
      midiOut,
      numChannels,
      numChannelsSoloed,
      playing,
      preventUpdate,
      resetTransport,
      resizing,
      restartChannels,
      setChannelState,
      showStepNumbers,
      tempo,
      theme,
      uiState.channels,
      view,
    ]
  )

  const presetOptions = useMemo(() => presets.map((p) => ({ label: p.name, value: p.id })), [presets])

  return (
    <div
      id="container"
      ref={container}
      className={classNames({
        grabbing,
        resizing,
        'dark-theme': theme === 'dark',
        'contrast-theme': theme === 'contrast',
      })}>
      <Header
        tempo={tempo}
        setTempo={setTempo}
        playing={playing}
        setPlaying={setPlaying}
        midiOuts={midiOuts}
        midiOut={midiOut}
        midiIns={midiIns}
        midiIn={midiIn}
        setMidiOut={setMidiOut}
        setMidiIn={setMidiIn}
        midiEnabled={midiEnabled}
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
        presetOptions={presetOptions}
        setPreset={setPreset}
        presetDirty={presetDirty}
        presetHotkey={uiState.hotkey}
        savePreset={savePreset}
        newPreset={newPreset}
        deletePreset={deletePreset}
        setModalType={setModalType}
        theme={theme}
        triggerTransportReset={triggerTransportReset}
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
      <CSSTransition in={!!modalType} timeout={300} classNames="show" onEnter={showModal} onExited={hideModal}>
        <Modal
          modalContent={modalContent}
          modalType={modalType}
          setModalType={setModalType}
          showStepNumbers={showStepNumbers}
          setShowStepNumbers={setShowStepNumbers}
          linearKnobs={linearKnobs}
          setLinearKnobs={setLinearKnobs}
          defaultChannelModeKeybd={defaultChannelModeKeybd}
          setDefaultChannelModeKeybd={setDefaultChannelModeKeybd}
          presetsRestartTransport={presetsRestartTransport}
          setPresetsRestartTransport={setPresetsRestartTransport}
          theme={theme}
          setTheme={setTheme}
          presets={presets}
          importPresets={importPresets}
        />
      </CSSTransition>
    </div>
  )
}

function channelCopy(c) {
  return Object.assign({}, c, {
    key: c.key.slice(),
    seqSteps: c.seqSteps.slice(),
    instrumentParams: Object.assign({}, c.instrumentParams),
  })
}

function deepStateCopy(state) {
  return Object.assign({}, state, {
    channels: state.channels.map((c) => channelCopy(c)),
  })
}

function initializePresets() {
  const presets = JSON.parse(window.localStorage.getItem('presets'))
  const examplePreset = DEFAULT_PRESET
  const exampleChannel = examplePreset.channels[0]
  let updated = false
  presets.forEach((preset) => {
    for (const prop in examplePreset) {
      if (preset[prop] === undefined) {
        preset[prop] = examplePreset[prop]
        updated = true
      }
    }
    preset.channels.forEach((channel) => {
      if (!Object.keys(INSTRUMENT_TYPES).includes(channel.instrumentType)) {
        channel.instrumentParams.synthType =
          Object.keys(SIGNAL_TYPES).includes(channel.instrumentType) ||
          channel.instrumentType.startsWith('fm') ||
          channel.instrumentType.startsWith('am') ||
          channel.instrumentType.startsWith('fat')
            ? channel.instrumentType
            : exampleChannel.instrumentParams.synthType
        channel.instrumentType = 'synth'
      }
      for (const prop in exampleChannel) {
        if (channel[prop] === undefined) {
          channel[prop] = exampleChannel[prop]
          updated = true
        }
      }
      for (const prop in exampleChannel.instrumentParams) {
        if (channel.instrumentParams[prop] === undefined) {
          channel.instrumentParams[prop] = exampleChannel.instrumentParams[prop]
          updated = true
        }
      }
    })
  })
  if (updated) {
    window.localStorage.setItem('presets', JSON.stringify(presets))
  }
  return presets
}

function initialPreset() {
  const presets = JSON.parse(window.localStorage.getItem('presets'))
  return window.localStorage.getItem('activePreset')
    ? presets.find((p) => p.id === window.localStorage.getItem('activePreset'))
    : presets[0] || DEFAULT_PRESET
}

function initializeUiState() {
  if (!window.localStorage.getItem('activePatch')) {
    window.localStorage.setItem('activePatch', JSON.stringify(initialPreset()))
  }
  return JSON.parse(window.localStorage.getItem('activePatch'))
}
