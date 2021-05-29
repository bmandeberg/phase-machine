import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import regeneratorRuntime from 'regenerator-runtime'
import * as Tone from 'tone'
import WebMidi from 'webmidi'
import classNames from 'classnames'
import { CSSTransition } from 'react-transition-group'
import { v4 as uuid } from 'uuid'
import arrayMove from 'array-move'
import { VIEWS, SECTIONS, DEFAULT_PRESET, BLANK_CHANNEL, CHANNEL_COLORS } from './globals'
import Header from './components/Header'
import Channel from './components/Channel'
import Modal from './components/Modal'
import usePresets from './hooks/usePresets'

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

  const [tempo, setTempo] = useState(JSON.parse(window.localStorage.getItem('tempo')) ?? 120)
  const [playing, setPlaying] = useState(false)
  const [numChannels, setNumChannels] = useState(currentPreset.numChannels)
  const [view, setView] = useState(VIEWS[0])
  const [midiOut, setMidiOut] = useState(null)
  const [midiOuts, setMidiOuts] = useState([])
  const [scrollTo, setScrollTo] = useState(SECTIONS[0])
  const [channelSync, setChannelSync] = useState(currentPreset.channelSync)

  const [modalType, setModalType] = useState('')

  const [grabbing, setGrabbing] = useState(false)
  const [resizing, setResizing] = useState(false)
  const keydownTimer = useRef(null)

  const container = useRef()
  const viewRef = useRef()

  // settings
  const [showStepNumbers, setShowStepNumbers] = useState(
    JSON.parse(window.localStorage.getItem('showStepNumbers')) ?? false
  )
  const [separateMIDIChannels, setSeparateMIDIChannels] = useState(
    JSON.parse(window.localStorage.getItem('separateMIDIChannels')) ?? true
  )
  const [linearKnobs, setLinearKnobs] = useState(JSON.parse(window.localStorage.getItem('linearKnobs')) ?? true)

  useEffect(() => {
    window.localStorage.setItem('showStepNumbers', showStepNumbers)
  }, [showStepNumbers])

  useEffect(() => {
    window.localStorage.setItem('separateMIDIChannels', separateMIDIChannels)
  }, [separateMIDIChannels])

  useEffect(() => {
    window.localStorage.setItem('linearKnobs', linearKnobs)
  }, [linearKnobs])

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
    window.localStorage.setItem('tempo', tempo)
  }, [tempo])

  const numChannelsSoloed = useMemo(() => uiState.channels.reduce((acc, curr) => acc + (curr.solo ? 1 : 0), 0), [
    uiState,
  ])

  const { setChannelState, setPresetName, presetDirty, setPreset, savePreset, newPreset, deletePreset } = usePresets(
    setUIState,
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
          uiStateCopy.channels.push(BLANK_CHANNEL(uiStateCopy.channels.length, getChannelColor(uiStateCopy.channels)))
        }
      } else {
        uiStateCopy.channels = uiStateCopy.channels.slice(0, numChannels)
        uiStateCopy.channels.forEach((channel, i) => {
          channel.channelNum = i
        })
      }
      return uiStateCopy
    })
  }, [getChannelColor, numChannels, setUIState])

  const duplicateChannel = useCallback(
    (id) => {
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
    },
    [getChannelColor]
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
          separateMIDIChannels={separateMIDIChannels}
          linearKnobs={linearKnobs}
          midiOut={midiOut}
          setChannelState={setChannelState}
          channelPreset={currentPreset.channels[i]}
          duplicateChannel={duplicateChannel}
          deleteChannel={deleteChannel}
          initState={d}
          container={container}
          changeChannelOrder={changeChannelOrder}
        />
      )),
    [
      changeChannelOrder,
      currentPreset.channels,
      deleteChannel,
      duplicateChannel,
      grabbing,
      linearKnobs,
      midiOut,
      numChannels,
      numChannelsSoloed,
      playing,
      resizing,
      separateMIDIChannels,
      setChannelState,
      showStepNumbers,
      tempo,
      uiState.channels,
      view,
    ]
  )

  return (
    <div id="container" ref={container} className={classNames({ grabbing, resizing })}>
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
          linearKnobs={linearKnobs}
          setLinearKnobs={setLinearKnobs}
        />
      </CSSTransition>
    </div>
  )
}

function channelCopy(c) {
  return Object.assign({}, c, { key: c.key.slice(), seqSteps: c.seqSteps.slice() })
}

function deepStateCopy(state) {
  return Object.assign({}, state, {
    channels: state.channels.map((c) => channelCopy(c)),
  })
}
