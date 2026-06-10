'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import * as Tone from 'tone'
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
  migrateEffectSlots,
  CHANNEL_COLORS,
  INSTRUMENT_TYPES,
  SIGNAL_TYPES,
} from './globals'
import Header from './components/Header'
import Channel from './components/Channel'
import Modal from './components/Modal'
import AlertDialog from './components/AlertDialog'
import usePresets from './hooks/usePresets'
import useMIDI, { midiStartContinue, midiStop } from './hooks/useMIDI'
import { subscribeDialogs, getActiveDialog, DialogRequest } from './dialog'
import { Channel as ChannelType, Preset } from './types'

// load/set presets
if (!window.localStorage.getItem('presets')) {
  window.localStorage.setItem('presets', DEFAULT_PRESETS)
  const defaultPresets = JSON.parse(DEFAULT_PRESETS)
  window.localStorage.setItem('activePreset', defaultPresets[0].id)
}

const PIANO_SCROLL = 60
const SEQ_SCROLL = 76
// How far the channel must scroll horizontally before the (absolute, scroll-away)
// duplicate/delete buttons are gone and the sticky mute/solo buttons animate in.
const MUTE_SOLO_SCROLL = 40

export default function App() {
  const [presets, setPresets] = useState(initializePresets)
  const [currentPreset, setCurrentPreset] = useState(initialPreset)
  const [uiState, setUIState] = useState(initializeUiState)

  const [tempo, setTempo] = useState(uiState.tempo)
  const [playing, setPlaying] = useState(false)
  const [numChannels, setNumChannels] = useState(uiState.numChannels)
  const [view, setView] = useState(window.localStorage.getItem('view') ?? VIEWS[1])
  const viewRef = useRef<string | undefined>(undefined)
  viewRef.current = view

  const [restartChannels, setRestartChannels] = useState(true)
  const [resetTransport, setResetTransport] = useState(false)
  const [scrollTo, setScrollTo] = useState(SECTIONS[0])
  const [channelSync, setChannelSync] = useState(uiState.channelSync)

  const [modalType, setModalType] = useState<string | null>('')
  const [modalContent, setModalContent] = useState(false)
  const showModal = useCallback(() => {
    setModalContent(true)
  }, [])
  const hideModal = useCallback(() => {
    setModalContent(false)
  }, [])

  const [grabbing, setGrabbing] = useState(false)
  const [resizing, setResizing] = useState(false)
  const keydownTimer = useRef<number | null | false>(null)

  const {
    midiOutRef,
    midiInRef,
    midiOut,
    midiIn,
    midiNoteOn,
    midiNoteOff,
    midiOuts,
    midiIns,
    setMidiOut,
    setMidiIn,
    midiEnabled,
    midiUnavailableReason,
    midiClockIn,
    setMidiClockIn,
    midiClockOut,
    setMidiClockOut,
  } = useMIDI(setPlaying, setResetTransport)

  useEffect(() => {
    if (resetTransport) {
      Tone.getTransport().stop()
      midiStop(midiOutRef.current, midiInRef.current && midiInRef.current.name, true)
      if (playing) {
        Tone.getTransport().start()
        midiStartContinue(midiOutRef.current, midiInRef.current && midiInRef.current.name)
      }
      setResetTransport(false)
    }
  }, [midiInRef, midiOutRef, playing, resetTransport])
  const triggerTransportReset = useCallback(() => {
    setResetTransport(true)
  }, [])

  const [preventUpdate, setPreventUpdate] = useState<boolean | undefined>()
  useEffect(() => {
    if (preventUpdate) {
      setPreventUpdate(false)
    }
  }, [preventUpdate])

  const container = useRef<HTMLDivElement | null>(null)
  const modalNodeRef = useRef<HTMLDivElement>(null)

  // Bridge the imperative dialog store (alertDialog/confirmDialog) to React state with a
  // plain subscribe, so the confirm/alert host renders through the same CSSTransition path
  // as <Modal>. (A prior useSyncExternalStore + portal version never showed on iOS Safari.)
  const alertNodeRef = useRef<HTMLDivElement>(null)
  const [activeDialog, setActiveDialog] = useState<DialogRequest | null>(getActiveDialog())
  useEffect(() => {
    const unsub = subscribeDialogs(() => setActiveDialog(getActiveDialog()))
    setActiveDialog(getActiveDialog())
    return unsub
  }, [])

  // settings

  const [showStepNumbers, setShowStepNumbers] = useState(
    JSON.parse(window.localStorage.getItem('showStepNumbers') as string) ?? true
  )

  const [theme, setTheme] = useState(window.localStorage.getItem('theme') ?? 'dark')

  const [defaultChannelModeKeybd, setDefaultChannelModeKeybd] = useState(
    JSON.parse(window.localStorage.getItem('defaultChannelModeKeybd') as string) ?? false
  )

  const [presetsRestartTransport, setPresetsRestartTransport] = useState(
    JSON.parse(window.localStorage.getItem('presetsRestartTransport') as string) ?? true
  )

  const [presetsStopTransport, setPresetsStopTransport] = useState(
    JSON.parse(window.localStorage.getItem('presetsStopTransport') as string) ?? true
  )

  const [ignorePresetsTempo, setIgnorePresetsTempo] = useState(
    JSON.parse(window.localStorage.getItem('ignorePresetsTempo') as string) ?? false
  )

  // Global output attenuator (0..1, 1 = unity / 100%). Applied to the master.
  const [globalVolume, setGlobalVolume] = useState(
    JSON.parse(window.localStorage.getItem('globalVolume') as string) ?? 1
  )

  useEffect(() => {
    window.localStorage.setItem('showStepNumbers', showStepNumbers)
  }, [showStepNumbers])

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
    window.localStorage.setItem('presetsStopTransport', presetsStopTransport)
  }, [presetsStopTransport])

  useEffect(() => {
    window.localStorage.setItem('ignorePresetsTempo', ignorePresetsTempo)
  }, [ignorePresetsTempo])

  useEffect(() => {
    window.localStorage.setItem('globalVolume', globalVolume)
    // Convert the 0..1 linear attenuator to the master volume Param (dB).
    Tone.getDestination().volume.value = Tone.gainToDb(globalVolume)
  }, [globalVolume])

  useEffect(() => {
    window.localStorage.setItem('view', view)
    setTimeout(() => {
      ;(document.activeElement as HTMLElement | null)?.blur()
    }, 500)
  }, [view])

  // init scrolling

  const topGradient = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const containerEl = container.current
    if (!containerEl) return
    function handleScroll() {
      if (viewRef.current === 'horizontal') {
        const scrollPositions = [
          0,
          (document.querySelector('.piano') as HTMLElement).offsetLeft - PIANO_SCROLL,
          (document.querySelector('.sequencer') as HTMLElement).offsetLeft - SEQ_SCROLL,
        ]
        let scrollEl = 0
        for (let i = 0; i < SECTIONS.length; i++) {
          // containerEl is guaranteed non-null by the early return above; TS just
          // can't carry that narrowing into this nested handler.
          if (containerEl!.scrollLeft >= scrollPositions[i]) {
            scrollEl = i
          }
        }
        setScrollTo(SECTIONS[scrollEl])
      }
      if (topGradient.current) {
        topGradient.current.style.top = 44 + Math.min(containerEl!.scrollTop, 16) + 'px'
      }
      // Reveal the sticky mute/solo buttons once scrolled past the duplicate/delete
      // buttons. Plain class toggle (no React state) so it doesn't re-render channels.
      containerEl!.classList.toggle('scrolled-x', containerEl!.scrollLeft > MUTE_SOLO_SCROLL)
    }
    containerEl.addEventListener('scroll', handleScroll)
    return () => {
      containerEl.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const updateView = useCallback((view: string) => {
    viewRef.current = view
    if (view === 'horizontal') {
      setScrollTo(SECTIONS[0])
    }
    setView(view)
  }, [])

  const doScroll = useCallback((scrollEl: string) => {
    const scrollPositions = [
      0,
      (document.querySelector('.piano') as HTMLElement).offsetLeft - PIANO_SCROLL,
      (document.querySelector('.sequencer') as HTMLElement).offsetLeft - SEQ_SCROLL,
    ]
    const scrollElIndex = SECTIONS.indexOf(scrollEl)
    if (scrollElIndex !== -1) {
      container.current?.scroll({
        left: scrollPositions[scrollElIndex],
        behavior: 'smooth',
      })
    }
  }, [])

  useEffect(() => {
    container.current?.scroll({
      left: 0,
    })
  }, [view])

  useEffect(() => {
    if (Tone.getTransport().bpm.value !== tempo) {
      Tone.getTransport().bpm.value = tempo
    }
  }, [tempo])

  const numChannelsSoloed = useMemo(
    () => uiState.channels.reduce((acc: number, curr: ChannelType) => acc + (curr.solo ? 1 : 0), 0),
    [uiState]
  )

  const {
    setChannelState,
    setChannelColor,
    setPresetName,
    presetDirty,
    setPreset,
    savePreset,
    newPreset,
    deletePreset,
    importPresets,
  } = usePresets(
      setUIState,
      channelSync,
      tempo,
      setTempo,
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
      presetsStopTransport,
      playing,
      setPlaying,
      midiOutRef,
      midiInRef,
      ignorePresetsTempo
    )

  // channel management

  const getChannelColor = useCallback((channels: ChannelType[]) => {
    const nextColor = CHANNEL_COLORS.find((color) => !channels.map((c) => c.color).includes(color))
    return nextColor || CHANNEL_COLORS[0]
  }, [])

  useEffect(() => {
    setUIState((uiState: Preset) => {
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
    (id: string) => {
      if (uiState.channels.length < MAX_CHANNELS) {
        setUIState((uiState: Preset) => {
          const uiStateCopy = deepStateCopy(uiState)
          const channelNum = uiStateCopy.channels.find((c) => c.id === id)!.channelNum
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
        setNumChannels((numChannels: number) => numChannels + 1)
        setPreventUpdate(true)
      }
    },
    [getChannelColor, uiState.channels.length]
  )

  const deleteChannel = useCallback((id: string) => {
    setUIState((uiState: Preset) => {
      const uiStateCopy = deepStateCopy(uiState)
      const channelNum = uiStateCopy.channels.find((c) => c.id === id)!.channelNum
      uiStateCopy.channels.splice(channelNum, 1)
      uiStateCopy.channels.forEach((channel, i) => {
        channel.channelNum = i
      })
      return uiStateCopy
    })
    setNumChannels((numChannels: number) => numChannels - 1)
    setPreventUpdate(true)
  }, [])

  const changeChannelOrder = useCallback((channelNum: number, newChannelNum: number) => {
    setUIState((uiState: Preset) => {
      const uiStateCopy = deepStateCopy(uiState)
      uiStateCopy.channels = arrayMove(uiStateCopy.channels, channelNum, newChannelNum)
      uiStateCopy.channels.forEach((channel, i) => {
        channel.channelNum = i
      })
      return uiStateCopy
    })
    setPreventUpdate(true)
  }, [])

  const longestSequence = useMemo(() => Math.max(...uiState.channels.map((c) => c.seqLength)), [uiState])

  const longestAuxChannel = useMemo(() => 277.66 + longestSequence * (22 + 18), [longestSequence])

  // render UI

  const channels = useMemo(
    () =>
      uiState.channels.map((d: ChannelType) => (
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
          midiOut={midiOut}
          setChannelState={setChannelState}
          setChannelColor={setChannelColor}
          // match by id (not index) so a freshly added channel — whose id isn't in the
          // current preset — gets no preset applied and stays blank, instead of inheriting
          // the preset's channel at that position.
          channelPreset={currentPreset.channels.find((c: ChannelType) => c.id === d.id)}
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
          longestSequence={longestSequence}
        />
      )),
    [
      changeChannelOrder,
      currentPreset.channels,
      defaultChannelModeKeybd,
      deleteChannel,
      duplicateChannel,
      grabbing,
      longestSequence,
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

  const presetOptions = useMemo(() => presets.map((p: Preset) => ({ label: p.name, value: p.id })), [presets])

  return (
    <div
      id="container"
      ref={container}
      className={classNames({
        grabbing,
        resizing,
        'dark-theme': theme === 'dark',
        'contrast-theme': theme === 'contrast',
        'aero-theme': theme === 'aero',
        'coquette-theme': theme === 'coquette',
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
        midiUnavailableReason={midiUnavailableReason}
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
        globalVolume={globalVolume}
        setGlobalVolume={setGlobalVolume}
        grabbing={grabbing}
        setGrabbing={setGrabbing}
      />
      <div id="header-border"></div>
      <div id="channels" className={classNames({ empty: numChannels === 0 })}>
        <div className="channels-flex-column">
          <div className="channels-flex">
            <div className="channels-container">
              {channels}
              {(view === 'stacked' || view === 'condensed') && (
                <div
                  className="stacked-spacer"
                  style={{ height: numChannels * 97, minWidth: longestAuxChannel + 'px' }}></div>
              )}
            </div>
            <div className="border-gradient gradient-right"></div>
          </div>
          <div className="border-gradient gradient-bottom"></div>
        </div>
        {numChannels === 0 && (
          <div className="no-channels">
            <p>😴</p>
            <p>no channels</p>
          </div>
        )}
        <div className="border-gradient gradient-top" ref={topGradient}></div>
      </div>
      <CSSTransition
        in={!!modalType}
        timeout={300}
        classNames="show"
        onEnter={showModal}
        onExited={hideModal}
        nodeRef={modalNodeRef}>
        <Modal
          nodeRef={modalNodeRef}
          modalContent={modalContent}
          modalType={modalType}
          setModalType={setModalType}
          showStepNumbers={showStepNumbers}
          setShowStepNumbers={setShowStepNumbers}
          defaultChannelModeKeybd={defaultChannelModeKeybd}
          setDefaultChannelModeKeybd={setDefaultChannelModeKeybd}
          presetsRestartTransport={presetsRestartTransport}
          setPresetsRestartTransport={setPresetsRestartTransport}
          midiClockIn={midiClockIn}
          setMidiClockIn={setMidiClockIn}
          midiClockOut={midiClockOut}
          setMidiClockOut={setMidiClockOut}
          theme={theme}
          setTheme={setTheme}
          presets={presets}
          importPresets={importPresets}
          ignorePresetsTempo={ignorePresetsTempo}
          setIgnorePresetsTempo={setIgnorePresetsTempo}
          presetsStopTransport={presetsStopTransport}
          setPresetsStopTransport={setPresetsStopTransport}
        />
      </CSSTransition>
      <CSSTransition in={!!activeDialog} timeout={300} classNames="show" nodeRef={alertNodeRef}>
        <AlertDialog nodeRef={alertNodeRef} dialog={activeDialog} />
      </CSSTransition>
    </div>
  )
}

function channelCopy(c: ChannelType): ChannelType {
  return Object.assign({}, c, {
    key: c.key.slice(),
    seqSteps: c.seqSteps.slice(),
    instrumentParams: Object.assign({}, c.instrumentParams),
  })
}

function deepStateCopy(state: Preset): Preset {
  return Object.assign({}, state, {
    channels: state.channels.map((c) => channelCopy(c)),
  })
}

// The patch* helpers backfill missing fields on presets/channels loaded from
// localStorage or imported files (schema migration). The objects are partially
// formed, so they're walked generically via a loose indexable view.
export function patchPreset(preset: Preset, updated?: boolean) {
  const p = preset as unknown as Record<string, unknown>
  const defaults = DEFAULT_PRESET as unknown as Record<string, unknown>
  for (const prop in DEFAULT_PRESET) {
    if (p[prop] === undefined) {
      p[prop] = defaults[prop]
      updated = true
    }
  }
  return updated
}

export function patchChannel(channel: ChannelType, updated?: boolean) {
  const defaultChannel = DEFAULT_PRESET.channels[0]
  const c = channel as unknown as Record<string, unknown>
  // Migrate the retired orange channel color to baby pink so orange is reserved for the
  // "playing" indicator (channel/instrument selected/on now uses the channel color).
  if (c.color === '#ff9700') {
    c.color = '#ff85de'
    updated = true
  }
  const cParams = channel.instrumentParams as unknown as Record<string, unknown>
  const dc = defaultChannel as unknown as Record<string, unknown>
  const dcParams = defaultChannel.instrumentParams as unknown as Record<string, unknown>
  for (const prop in defaultChannel) {
    if (c[prop] === undefined) {
      c[prop] = dc[prop]
      updated = true
    }
  }
  // 3-slot effects: migrate legacy single-effect presets into slot 0 / normalize.
  // Flag a change only when there was no `effects` yet (avoids spurious re-saves on
  // every load). NB: must run BEFORE the generic instrumentParams fill, and that
  // loop must SKIP `effects` so it never aliases DEFAULT_PRESET's slot array onto
  // every channel (migrateEffectSlots always returns fresh per-channel objects).
  if (cParams.effects === undefined) {
    updated = true
  }
  cParams.effects = migrateEffectSlots(cParams)
  for (const prop in defaultChannel.instrumentParams) {
    if (prop === 'effects') continue
    if (cParams[prop] === undefined) {
      cParams[prop] = dcParams[prop]
      updated = true
    }
  }
  return updated
}

export function patchPresetAndChannels(preset: Preset, updated?: boolean) {
  updated = patchPreset(preset, updated)
  preset.channels.forEach((channel) => {
    updated = patchChannel(channel, updated)
  })
  return updated
}

function initializePresets(): Preset[] {
  const presets: Preset[] = JSON.parse(window.localStorage.getItem('presets') as string)
  const examplePreset = DEFAULT_PRESET
  const exampleChannel = examplePreset.channels[0]
  let updated: boolean | undefined = false
  presets.forEach((preset) => {
    updated = patchPreset(preset, updated)
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
      updated = patchChannel(channel, updated)
    })
  })
  if (updated) {
    window.localStorage.setItem('presets', JSON.stringify(presets))
  }
  return presets
}

function initialPreset(): Preset {
  const presets: Preset[] = JSON.parse(window.localStorage.getItem('presets') as string)
  return window.localStorage.getItem('activePreset')
    ? presets.find((p) => p.id === window.localStorage.getItem('activePreset'))!
    : presets[0] || DEFAULT_PRESET
}

function initializeUiState(): Preset {
  if (!window.localStorage.getItem('activePatch')) {
    window.localStorage.setItem('activePatch', JSON.stringify(initialPreset()))
  }
  const activePatch: Preset = JSON.parse(window.localStorage.getItem('activePatch') as string)
  patchPresetAndChannels(activePatch)
  return activePatch
}
