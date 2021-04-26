import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import regeneratorRuntime from 'regenerator-runtime'
import * as Tone from 'tone'
import WebMidi from 'webmidi'
import classNames from 'classnames'
import { v4 as uuid } from 'uuid'
import { VIEWS, SECTIONS, DEFAULT_SETTINGS, BLANK_PRESET } from './globals'
import Header from './components/Header'
import Channel from './components/Channel'

const CLOCK_WIDTH = 658

export default function App() {
  const [presets, setPresets] = useState([BLANK_PRESET])
  const [currentPreset, setCurrentPreset] = useState(presets[0])
  const [uiState, setUIState] = useState(BLANK_PRESET)

  const [tempo, setTempo] = useState(120)
  const [playing, setPlaying] = useState(false)
  const [numChannels, setNumChannels] = useState(1)
  const [view, setView] = useState(VIEWS[0])
  const [midiOut, setMidiOut] = useState(null)
  const [midiOuts, setMidiOuts] = useState([])
  const [scrollTo, setScrollTo] = useState(SECTIONS[0])
  const [channelSync, setChannelSync] = useState(false)
  const [numChannelsSoloed, setNumChannelsSoloed] = useState(0)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  const [grabbing, setGrabbing] = useState(false)
  const [resizing, setResizing] = useState(false)

  const container = useRef()
  const viewRef = useRef()

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

  // state management for presets

  const setChannelState = useCallback((channelNum, state) => {
    setUIState((uiState) => {
      const uiStateCopy = Object.assign({}, uiState)
      uiStateCopy.channels[channelNum] = state
      return uiStateCopy
    })
  }, [])

  useEffect(() => {
    setUIState((uiState) => {
      const uiStateCopy = Object.assign({}, uiState)
      uiStateCopy.channels = uiStateCopy.channels.slice(0, numChannels)
      return uiStateCopy
    })
  }, [numChannels])

  useEffect(() => {
    setUIState((uiState) => {
      const uiStateCopy = Object.assign({}, uiState, {
        tempo,
        numChannels,
        channelSync,
        numChannelsSoloed,
      })
      return uiStateCopy
    })
  }, [channelSync, numChannels, numChannelsSoloed, tempo])

  const setPreset = useCallback(
    (presetID) => {
      const preset = presets.find((p) => p.id === presetID)
      setCurrentPreset(deepStateCopy(preset))
      setUIState(deepStateCopy(preset))
      setTempo(preset.tempo)
      setNumChannels(preset.numChannels)
      setChannelSync(preset.channelSync)
      setNumChannelsSoloed(preset.numChannelsSoloed)
    },
    [presets]
  )

  const setPresetName = useCallback((presetName) => {
    setUIState((uiState) => {
      return Object.assign({}, uiState, { name: presetName.target.value })
    })
  }, [])

  const presetDirty = useMemo(() => {
    for (const param in uiState) {
      if (uiState.hasOwnProperty(param)) {
        // check global preset params
        if (param !== 'channels') {
          if (uiState[param] !== currentPreset[param]) {
            return true
          }
        } else {
          // check channels
          for (let i = 0; i < uiState[param].length; i++) {
            if (!currentPreset[param][i]) return true
            const channel = uiState[param][i]
            const presetChannel = currentPreset[param][i]
            for (const channelParam in channel) {
              if (channel.hasOwnProperty(channelParam)) {
                // compare arrays
                if (['key', 'seqSteps'].some((s) => s === channelParam)) {
                  for (let j = 0; j < channel[channelParam].length; j++) {
                    if (channel[channelParam][j] !== presetChannel[channelParam][j]) {
                      return true
                    }
                  }
                } else if (channelParam === 'instrumentType') {
                  // compare special cases
                  if (channel[channelParam].value !== presetChannel[channelParam].value) {
                    return true
                  }
                } else {
                  // compare everything else
                  if (channel[channelParam] !== presetChannel[channelParam]) {
                    return true
                  }
                }
              }
            }
          }
        }
      }
    }
    return false
  }, [currentPreset, uiState])

  // preset actions

  const dedupName = useCallback(
    (name, id) => {
      const sameNamePreset = presets.find((p) => p.name === name)
      if (sameNamePreset && !(id && sameNamePreset.id === id)) {
        const digitMatch = /\s\((\d+)\)$/
        const baseName = name.replace(digitMatch, '')
        const incRegex = new RegExp(baseName + '\\s\\((\\d+)\\)$')
        const nameIncrements = presets.reduce(
          (acc, curr) => {
            const match = curr.name.match(incRegex)
            if (match && !(id && curr.id === id)) {
              acc.push(+match[1])
            }
            return acc
          },
          [1]
        )
        const maxInc = Math.max(...nameIncrements)
        return `${baseName} (${maxInc + 1})`
      } else return name
    },
    [presets]
  )

  const savePreset = useCallback(() => {
    const uiStateCopy = Object.assign({}, uiState, { placeholder: false })
    for (let i = 0; i < presets.length; i++) {
      if (presets[i].name === uiStateCopy.name && presets[i].id !== uiStateCopy.id) {
        uiStateCopy.name = dedupName(uiStateCopy.name, uiStateCopy.id)
        break
      }
    }
    setUIState(deepStateCopy(uiStateCopy))
    setCurrentPreset(uiStateCopy)
    setPresets((presets) => {
      const presetsCopy = presets.slice()
      const i = presetsCopy.findIndex((p) => p.id === uiStateCopy.id)
      if (i !== -1) {
        presetsCopy[i] = uiStateCopy
      } else {
        presetsCopy.push(uiStateCopy)
      }
      return presetsCopy
    })
  }, [dedupName, presets, uiState])

  const newPreset = useCallback(() => {
    const uiStateCopy = Object.assign({}, uiState, {
      name: dedupName(uiState.name),
      placeholder: false,
      id: uuid(),
      hotkey: null,
    })
    // sync state and presets
    setUIState(deepStateCopy(uiStateCopy))
    setCurrentPreset(uiStateCopy)
    setPresets((presets) => {
      const presetsCopy = presets.slice()
      presetsCopy.push(uiStateCopy)
      return presetsCopy
    })
  }, [dedupName, uiState])

  const deletePreset = useCallback(() => {
    const uiStateCopy = Object.assign({}, uiState, {
      name: dedupName('New Preset', uiState.id),
      id: uuid(),
      hotkey: null,
      placeholder: true,
    })
    setPresets((presets) => presets.filter((p) => p.id !== uiState.id))
    setUIState(deepStateCopy(uiStateCopy))
    setCurrentPreset(uiStateCopy)
  }, [dedupName, uiState])

  // useEffect(() => {
  //   console.log(currentPreset)
  // }, [currentPreset, presets])

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
          setNumChannelsSoloed={setNumChannelsSoloed}
          tempo={tempo}
          playing={playing}
          settings={settings}
          midiOut={midiOut}
          setChannelState={setChannelState}
          channelPreset={currentPreset.channels[i]}
        />
      )),
    [
      currentPreset,
      grabbing,
      midiOut,
      numChannels,
      numChannelsSoloed,
      playing,
      resizing,
      setChannelState,
      settings,
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
    </div>
  )
}

function deepStateCopy(state) {
  return Object.assign({}, state, {
    channels: state.channels.map((c) => Object.assign({}, c, { key: c.key.slice(), seqSteps: c.seqSteps.slice() })),
  })
}
