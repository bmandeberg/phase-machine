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
import AddChannel from './components/AddChannel'
import Modal from './components/Modal'
import AlertDialog from './components/AlertDialog'
import usePresets from './hooks/usePresets'
import useSelection from './hooks/useSelection'
import useSelectionHotkeys from './hooks/useSelectionHotkeys'
import useHistory, { deepEqual } from './hooks/useHistory'
import useMIDI, { midiStartContinue, midiStop } from './hooks/useMIDI'
import { subscribeDialogs, getActiveDialog, DialogRequest } from './dialog'
import { Channel as ChannelType, Preset, ApplyEdit, ApplyAction, ApplyChannelState, ChannelAction } from './types'

// load/set presets
if (!window.localStorage.getItem('presets')) {
  window.localStorage.setItem('presets', DEFAULT_PRESETS)
  const defaultPresets = JSON.parse(DEFAULT_PRESETS)
  window.localStorage.setItem('activePreset', defaultPresets[0].id)
}

// Each channel's left edge (number, scribbler, mute/solo) lives in a sticky header
// that floats over the horizontally-scrolling body. The "Scroll To" buttons jump to
// the piano / sequencer, so their target must clear that pinned header — otherwise
// the section lands partly behind it. Offset each target by the live width of its
// channel's sticky header (it differs per view — ~97px horizontal, ~103px condensed),
// plus a hair to clear the header's elevation shadow (which paints past its box edge
// and isn't counted in offsetWidth), so the section sits just past the header.
const STICKY_SHADOW = 8
function sectionScrollPositions(): number[] {
  const offsetFor = (el: HTMLElement | null) => {
    if (!el) return 0
    const sticky = el.closest('.channel')?.querySelector('.channel-sticky') as HTMLElement | null
    return el.offsetLeft - (sticky?.offsetWidth ?? 0) - STICKY_SHADOW
  }
  // Scroll to the sequencer's left edge (a direct child of .channel), pulled back by
  // the sticky header's width via offsetFor so the section clears the pinned header.
  // NB: we deliberately target .sequencer itself, not the .channel-module.border
  // divider just before it — that divider is display:none in the horizontal/condensed
  // views this runs in, so its offsetLeft is 0, which broke both the sequence scroll
  // target (clamped to ~0, "doesn't scroll") and the section highlight (scrollLeft >= a
  // negative position is always true, pinning it to "sequence").
  const seq = document.querySelector('.sequencer') as HTMLElement | null
  return [0, offsetFor(document.querySelector('.piano')), offsetFor(seq)]
}

export default function App() {
  const [presets, setPresets] = useState(initializePresets)
  const [currentPreset, setCurrentPreset] = useState(initialPreset)
  const [uiState, setUIState] = useState(initializeUiState)
  // latest uiState for imperative reads in hotkey handlers (unified mute/solo, delete)
  const uiStateRef = useRef(uiState)
  uiStateRef.current = uiState

  const [tempo, setTempo] = useState(uiState.tempo)
  const [playing, setPlaying] = useState(false)
  const [numChannels, setNumChannels] = useState(uiState.numChannels)
  const [view, setView] = useState(initialView)
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

  const [theme, setTheme] = useState(window.localStorage.getItem('theme') ?? 'eclipse')

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
      if (viewRef.current === 'horizontal' || viewRef.current === 'condensed') {
        const scrollPositions = sectionScrollPositions()
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
      // Reveal the sticky channel header's elevation shadow only once the channels
      // are scrolled horizontally — at rest it reads as a seamless part of the
      // channel. Plain class toggle (no React state) so it doesn't re-render.
      containerEl!.classList.toggle('scrolled-x', containerEl!.scrollLeft > 0)
    }
    containerEl.addEventListener('scroll', handleScroll)
    return () => {
      containerEl.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const updateView = useCallback((view: string) => {
    viewRef.current = view
    if (view === 'horizontal' || view === 'condensed') {
      setScrollTo(SECTIONS[0])
    }
    setView(view)
  }, [])

  const doScroll = useCallback((scrollEl: string) => {
    const scrollPositions = sectionScrollPositions()
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

  // selected channels (click / shift-range / cmd-toggle). orderedIds is in channelNum
  // order so shift-range math and pruning track reorders + deletions.
  const orderedIds = useMemo(() => uiState.channels.map((c: ChannelType) => c.id), [uiState.channels])
  const selection = useSelection(orderedIds)

  // The whole channel-selection feature (click/shift/cmd select, edit-selects-channel,
  // mirror fan-out, m/s/Delete/Escape hotkeys) is desktop-only: it relies on modifier
  // clicks and a keyboard, which don't translate to touch. On a touch device we make
  // `onSelect` a no-op and block the hotkeys — with nothing ever selected, fan-out, the
  // `selected` tint, and background-deselect all stay inert on their own.
  const isTouch = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches,
    []
  )
  const onSelect = useMemo(() => (isTouch ? () => {} : selection.clickSelect), [isTouch, selection.clickSelect])

  // Edit fan-out: each Channel registers an `applyEdit(field, value)` that writes the
  // field via its RAW setter (no re-emit). When a user edits a channel that's part of a
  // multi-selection, the channel calls `fanOutEdit`, which replays the edit onto the
  // other selected channels. Loop-free because applyEdit never re-emits.
  const channelApplyRegistry = useRef<Map<string, ApplyEdit>>(new Map())
  const registerApplyEdit = useCallback((id: string, fn: ApplyEdit) => {
    channelApplyRegistry.current.set(id, fn)
    return () => {
      channelApplyRegistry.current.delete(id)
    }
  }, [])
  const fanOutEdit = useCallback(
    (sourceId: string, field: keyof ChannelType, value: unknown) => {
      const sel = selection.selectedIdsRef.current
      if (sel.size < 2 || !sel.has(sourceId)) return
      sel.forEach((targetId) => {
        if (targetId !== sourceId) channelApplyRegistry.current.get(targetId)?.(field, value)
      })
    },
    [selection]
  )

  // Parallel registry for pattern/key GESTURES (toggle a step, shift, flip, …). Same
  // fan-out shape, but each target applies the action to its own data via applyAction.
  const channelActionRegistry = useRef<Map<string, ApplyAction>>(new Map())
  const registerApplyAction = useCallback((id: string, fn: ApplyAction) => {
    channelActionRegistry.current.set(id, fn)
    return () => {
      channelActionRegistry.current.delete(id)
    }
  }, [])
  const fanOutAction = useCallback(
    (sourceId: string, action: ChannelAction) => {
      const sel = selection.selectedIdsRef.current
      if (sel.size < 2 || !sel.has(sourceId)) return
      sel.forEach((targetId) => {
        if (targetId !== sourceId) channelActionRegistry.current.get(targetId)?.(action)
      })
    },
    [selection]
  )

  // Undo/redo restore: each Channel registers a full-snapshot apply (raw setters + Tone,
  // no re-emit). `applySnapshot` rewrites the musical/structural state from a history
  // entry without touching `currentPreset` (the dirty baseline stays the saved preset),
  // and preserves the preset's identity fields so an unrelated undo never reverts a
  // rename. New/removed channels mount-from-initState / unmount via the channels array.
  const channelRestoreRegistry = useRef<Map<string, ApplyChannelState>>(new Map())
  const registerApplyChannelState = useCallback((id: string, fn: ApplyChannelState) => {
    channelRestoreRegistry.current.set(id, fn)
    return () => {
      channelRestoreRegistry.current.delete(id)
    }
  }, [])
  const applySnapshot = useCallback((snap: Preset) => {
    const current = uiStateRef.current
    setTempo(snap.tempo)
    setChannelSync(snap.channelSync)
    setNumChannels(snap.numChannels)
    setUIState((prev: Preset) =>
      Object.assign({}, prev, {
        tempo: snap.tempo,
        channelSync: snap.channelSync,
        numChannels: snap.numChannels,
        channels: snap.channels.map((c) => channelCopy(c)),
      })
    )
    // Push the restored fields onto each still-mounted channel that actually changed.
    // (Re-added channels aren't registered yet — they initialize from their initState
    // prop on mount; removed channels just unmount.)
    snap.channels.forEach((ch: ChannelType) => {
      const cur = current.channels.find((c: ChannelType) => c.id === ch.id)
      if (!cur || deepEqual(cur, ch)) return
      const reloadInstr =
        cur.instrumentType !== ch.instrumentType || !deepEqual(cur.instrumentParams, ch.instrumentParams)
      channelRestoreRegistry.current.get(ch.id)?.(ch, { reloadInstr })
    })
    // No setPreventUpdate here (unlike the structural mutators): undo never touches
    // currentPreset, so every surviving channel's channelPreset prop is referentially
    // unchanged and its reload effect can't fire — there's nothing to suppress.
  }, [])
  const { undo, redo, canUndo, canRedo } = useHistory(uiState, applySnapshot)

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

  // Delete several channels at once (the Delete hotkey over a multi-selection): splice
  // them all, renumber once, drop the count, and clear the selection. Deleting every
  // channel is allowed — the empty state offers an "add a channel" button to recover.
  const deleteChannels = useCallback(
    (ids: string[]) => {
      if (!ids.length) return
      setUIState((uiState: Preset) => {
        const uiStateCopy = deepStateCopy(uiState)
        uiStateCopy.channels = uiStateCopy.channels.filter((c: ChannelType) => !ids.includes(c.id))
        uiStateCopy.channels.forEach((channel, i) => {
          channel.channelNum = i
        })
        return uiStateCopy
      })
      setNumChannels((numChannels: number) => numChannels - ids.length)
      setPreventUpdate(true)
      selection.deselectAll()
    },
    [selection]
  )

  // Copy / paste selected channels. The clipboard is an App-level ref of deep channel
  // copies, so pasting survives the source channels being edited or deleted, and persists
  // across preset changes for the life of the session.
  const channelClipboard = useRef<ChannelType[]>([])
  const copyChannels = useCallback(() => {
    const sel = selection.selectedIdsRef.current
    if (!sel.size) return
    // store in channel order so the pasted block keeps the on-screen order
    channelClipboard.current = uiStateRef.current.channels
      .filter((c: ChannelType) => sel.has(c.id))
      .map((c: ChannelType) => channelCopy(c))
  }, [selection])

  // Paste after the last selected channel (or at the end when nothing is selected), giving
  // each clone a fresh id + an unused color, then select the pasted block. Obeys the channel
  // limit: only as many as fit under MAX_CHANNELS are pasted; the rest are dropped.
  const pasteChannels = useCallback(() => {
    const clip = channelClipboard.current
    if (!clip.length) return
    const current = uiStateRef.current
    const room = MAX_CHANNELS - current.channels.length
    if (room <= 0) return
    const sel = selection.selectedIdsRef.current
    let insertAt = current.channels.length
    if (sel.size) {
      const selNums = current.channels.filter((c: ChannelType) => sel.has(c.id)).map((c: ChannelType) => c.channelNum)
      if (selNums.length) insertAt = Math.max(...selNums) + 1
    }
    // Build outside the state updater so ids/colors are stable under StrictMode's double
    // invoke; the running accumulator keeps pasted channels from colliding on color.
    const newChannels: ChannelType[] = []
    clip.slice(0, room).forEach((c: ChannelType) => {
      newChannels.push(
        Object.assign({}, channelCopy(c), {
          id: uuid(),
          color: getChannelColor(current.channels.concat(newChannels)),
        })
      )
    })
    setUIState((uiState: Preset) => {
      const uiStateCopy = deepStateCopy(uiState)
      uiStateCopy.channels.splice(insertAt, 0, ...newChannels.map((c) => channelCopy(c)))
      uiStateCopy.channels.forEach((channel, i) => {
        channel.channelNum = i
      })
      return uiStateCopy
    })
    setNumChannels((numChannels: number) => numChannels + newChannels.length)
    setPreventUpdate(true)
    selection.selectIds(newChannels.map((c) => c.id))
  }, [getChannelColor, selection])

  // m / s hotkeys: mute or solo every selected channel to a UNIFIED state — if any
  // selected channel is currently off, turn them all on; otherwise turn them all off.
  // Applied through each channel's applyEdit (the same raw-setter path as the fan-out).
  // Color uses an App-level setter (not channel-local state), so mirror it here: a color
  // change on a channel that's part of a multi-selection applies to all selected channels.
  const setChannelColorFanned = useCallback(
    (id: string, color: string) => {
      const sel = selection.selectedIdsRef.current
      if (sel.size >= 2 && sel.has(id)) {
        sel.forEach((tid) => setChannelColor(tid, color))
      } else {
        setChannelColor(id, color)
      }
    },
    [selection, setChannelColor]
  )

  // Each channel registers its openInstrumentModal so the `i` hotkey can open the
  // instrument editor for the selected channel (the first one in channel order when
  // several are selected) without threading a prop through every view.
  const channelOpenInstrumentRegistry = useRef<Map<string, () => void>>(new Map())
  const registerOpenInstrument = useCallback((id: string, fn: () => void) => {
    channelOpenInstrumentRegistry.current.set(id, fn)
    return () => {
      channelOpenInstrumentRegistry.current.delete(id)
    }
  }, [])
  const openInstrumentForSelection = useCallback(() => {
    const sel = selection.selectedIdsRef.current
    const firstId = orderedIds.find((id) => sel.has(id))
    if (firstId) channelOpenInstrumentRegistry.current.get(firstId)?.()
  }, [orderedIds, selection])

  const muteSoloSelected = useCallback(
    (field: 'mute' | 'solo') => {
      const ids = Array.from(selection.selectedIdsRef.current)
      if (!ids.length) return
      const channels = uiStateRef.current.channels
      const target = ids.some((id) => {
        const c = channels.find((ch: ChannelType) => ch.id === id)
        return c ? !c[field] : false
      })
      ids.forEach((id) => channelApplyRegistry.current.get(id)?.(field, target))
    },
    [selection]
  )

  // Click blank background to deselect (like Escape). Bubble phase: a channel click
  // selects in the channel's capture handler first, then bubbles here where we skip it
  // (target is inside a .channel). The header / add button / open modals are excluded.
  const onBackgroundMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!selection.anySelected() || modalType || activeDialog) return
      const t = e.target as HTMLElement
      if (t.closest('.channel') || t.closest('#header') || t.closest('.add-channel') || t.closest('.add-first-channel'))
        return
      selection.deselectAll()
    },
    [selection, modalType, activeDialog]
  )

  useSelectionHotkeys({
    anySelected: selection.anySelected,
    onMute: useCallback(() => muteSoloSelected('mute'), [muteSoloSelected]),
    onSolo: useCallback(() => muteSoloSelected('solo'), [muteSoloSelected]),
    onDelete: useCallback(() => deleteChannels(Array.from(selection.selectedIdsRef.current)), [deleteChannels, selection]),
    onDeselect: selection.deselectAll,
    onSelectAll: selection.selectAll,
    onOpenInstrument: openInstrumentForSelection,
    onSavePreset: useCallback(() => savePreset(null), [savePreset]),
    onCopy: copyChannels,
    onPaste: pasteChannels,
    canPaste: useCallback(() => channelClipboard.current.length > 0, []),
    isBlocked: useCallback(() => isTouch || !!modalType || !!activeDialog, [isTouch, modalType, activeDialog]),
  })

  // Append a blank channel (driven by the "+" button beneath the channels): bumping
  // numChannels triggers the effect above that pushes a BLANK_CHANNEL (and flashes
  // it as freshly created). Capped at MAX_CHANNELS (the button is hidden there too).
  const addChannel = useCallback(() => {
    setNumChannels((numChannels: number) => (numChannels < MAX_CHANNELS ? numChannels + 1 : numChannels))
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

  // Track which channel ids have already rendered so the one-shot create flash
  // plays only for channels the user just added — not on startup or view switches
  // (each view is a separate component that remounts). Lazy-init to the channels
  // present at first render so they don't flash on load; the effect below keeps it
  // current. (Updated in an effect, not during render, to stay StrictMode-safe.)
  const renderedChannelIds = useRef<Set<string> | undefined>(undefined)
  if (renderedChannelIds.current === undefined) {
    renderedChannelIds.current = new Set(uiState.channels.map((c: ChannelType) => c.id))
  }
  useEffect(() => {
    renderedChannelIds.current = new Set(uiState.channels.map((c: ChannelType) => c.id))
  }, [uiState.channels])

  const channels = useMemo(
    () =>
      uiState.channels.map((d: ChannelType) => {
        const flash = !renderedChannelIds.current!.has(d.id)
        return (
          <Channel
            numChannels={numChannels}
            key={d.id}
            flash={flash}
          color={d.color}
          channelNum={d.channelNum}
          selected={selection.isSelected(d.id)}
          selectionSize={selection.selectedIds.size}
          onSelect={onSelect}
          registerApplyEdit={registerApplyEdit}
          fanOutEdit={fanOutEdit}
          registerApplyAction={registerApplyAction}
          fanOutAction={fanOutAction}
          registerApplyChannelState={registerApplyChannelState}
          registerOpenInstrument={registerOpenInstrument}
          setGrabbing={setGrabbing}
          grabbing={grabbing}
          resizing={resizing}
          setResizing={setResizing}
          view={view}
          // count of OTHER soloed channels (exclude this one's own contribution) so a
          // channel's own solo toggle can't transiently mis-mute it — see Channel's `muted`
          numOtherChannelsSoloed={numChannelsSoloed - (d.solo ? 1 : 0)}
          tempo={tempo}
          playing={playing}
          showStepNumbers={showStepNumbers}
          midiOut={midiOut}
          setChannelState={setChannelState}
          setChannelColor={setChannelColorFanned}
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
        )
      }),
    [
      changeChannelOrder,
      currentPreset.channels,
      defaultChannelModeKeybd,
      deleteChannel,
      duplicateChannel,
      fanOutAction,
      fanOutEdit,
      grabbing,
      registerApplyAction,
      registerApplyChannelState,
      registerApplyEdit,
      registerOpenInstrument,
      longestSequence,
      midiNoteOff,
      midiNoteOn,
      midiOut,
      numChannels,
      numChannelsSoloed,
      onSelect,
      playing,
      preventUpdate,
      resetTransport,
      resizing,
      restartChannels,
      selection,
      setChannelColorFanned,
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
      onMouseDown={onBackgroundMouseDown}
      className={classNames({
        grabbing,
        resizing,
        'dark-theme': theme === 'dark',
        'contrast-theme': theme === 'contrast',
        'aero-theme': theme === 'aero',
        'coquette-theme': theme === 'coquette',
        'eclipse-theme': theme === 'eclipse',
        // the default 'light' theme (labelled "Toxic") had no class; add one so the
        // selected-channel wash can darken it specifically (all other themes lighten)
        'light-theme': theme === 'light',
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
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <div id="header-border"></div>
      <div id="channels" className={classNames({ empty: numChannels === 0 })}>
        <div className="channels-flex-column">
          <div className="channels-flex">
            <div className="channels-container">
              {channels}
              {view === 'stacked' && (
                <div
                  className="stacked-spacer"
                  style={{ height: numChannels * 97, minWidth: longestAuxChannel + 'px' }}></div>
              )}
              {numChannels > 0 && numChannels < MAX_CHANNELS && <AddChannel addChannel={addChannel} />}
            </div>
            <div className="border-gradient gradient-right"></div>
          </div>
          <div className="border-gradient gradient-bottom"></div>
        </div>
        {numChannels === 0 && (
          <div className="no-channels">
            <p>😴</p>
            <p>no channels</p>
            <div className="button add-first-channel no-select" onClick={addChannel}>
              add a channel
            </div>
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

export function patchChannel(channel: ChannelType, tempo?: number, updated?: boolean) {
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
  cParams.effects = migrateEffectSlots(cParams, tempo)
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
    updated = patchChannel(channel, preset.tempo, updated)
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
      updated = patchChannel(channel, preset.tempo, updated)
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

// Initial view: a stored preference always wins (switching views persists it). With no
// stored view, phones default to the most compact 'condensed' layout; everything else
// keeps the 'stacked' default. "Phone" = a touch device whose shorter screen edge is
// under 500px — phones sit ~360–430px there in any orientation, tablets ≥ ~740px.
function initialView(): string {
  const stored = window.localStorage.getItem('view')
  if (stored) return stored
  const isPhone =
    window.matchMedia('(hover: none) and (pointer: coarse)').matches &&
    Math.min(window.screen.width, window.screen.height) < 500
  return isPhone ? 'condensed' : VIEWS[1]
}
