import React, { useCallback, useRef, useEffect, useMemo } from 'react'
import classNames from 'classnames'
import Settings from './Settings'
import MIDIModal from './MIDIModal'
import InstrumentModal from './InstrumentModal'
import AboutModal from './AboutModal'
import VizModal, { VizData, VizActions } from './VizModal'
import { ChannelMidiAssignment, InstrumentParams, Preset } from '../types'
import './Modal.scss'

// How many <Modal>s (app settings, or any channel's instrument / MIDI editor) are
// currently open. Every modal shares this component, so tracking it here covers them
// all — including the per-channel modals whose open state App can't otherwise see.
// useSelectionHotkeys' isBlocked() reads this so Escape closes the modal without also
// deselecting the channel underneath.
let openModalCount = 0
export function isAnyModalOpen(): boolean {
  return openModalCount > 0
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ModalProps {
  // Shared with the wrapping <CSSTransition nodeRef>: react-transition-group needs a
  // DOM ref instead of findDOMNode (removed in React 19). Attached to the root element.
  nodeRef?: React.RefObject<HTMLDivElement | null>
  modalContent?: boolean
  modalType?: string | null
  setModalType: (type: string | null) => void
  showStepNumbers?: boolean
  setShowStepNumbers?: any
  defaultChannelModeKeybd?: boolean
  setDefaultChannelModeKeybd?: any
  theme: string
  setTheme?: any
  midiHold?: boolean
  setMidiHold?: any
  midiIn?: boolean | string
  setMidiIn?: any
  color?: string
  scribbler?: string
  customMidiInChannel?: boolean
  setCustomMidiInChannel?: any
  midiInChannel?: number
  setMidiInChannel?: any
  midiOutAll?: boolean
  setMidiOutAll?: any
  customMidiOutChannel?: boolean
  setCustomMidiOutChannel?: any
  channelNum?: number
  midiOutChannel?: number
  setMidiOutChannel?: any
  presets?: Preset[]
  importPresets?: any
  instrumentOn?: boolean
  setInstrumentOn?: any
  instrumentType?: string
  setInstrumentType?: any
  instrumentParams?: InstrumentParams
  setInstrumentParams?: any
  savedInstrumentParams?: InstrumentParams
  instruments?: any
  gainNode?: any
  pannerNode?: any
  slotNodesRef?: any
  rebuildEffectChain?: any
  grabbing?: boolean
  setGrabbing?: any
  tempo?: number
  // bump to remount InstrumentModal so its param hooks re-seed after an external
  // instrument change (undo/redo, preset load) — see Channel.instrumentSyncKey
  instrumentSyncKey?: number
  presetsRestartTransport?: boolean
  setPresetsRestartTransport?: any
  midiClockIn?: boolean
  setMidiClockIn?: any
  midiClockOut?: boolean
  setMidiClockOut?: any
  ignorePresetsTempo?: boolean
  setIgnorePresetsTempo?: any
  presetsStopTransport?: boolean
  setPresetsStopTransport?: any
  channelMidiAssignments?: ChannelMidiAssignment[]
  setChannelMidiAssignment?: (id: string, midiChannel: number | null) => void
  setChannelMidiInAssignment?: (id: string, midiChannel: number | null) => void
  // the channel's visualizer bundle — only built while that modal is open — and
  // the (stable) edit/audition hooks its interactive views use
  vizData?: VizData | null
  vizActions?: VizActions
  // visualizer header button: switch to the inline dock view below the channel
  onDockViz?: () => void
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function Modal({
  nodeRef,
  modalType,
  setModalType,
  showStepNumbers,
  setShowStepNumbers,
  defaultChannelModeKeybd,
  setDefaultChannelModeKeybd,
  theme,
  setTheme,
  midiHold,
  setMidiHold,
  midiIn,
  setMidiIn,
  color,
  scribbler,
  customMidiInChannel,
  setCustomMidiInChannel,
  midiInChannel,
  setMidiInChannel,
  midiOutAll,
  setMidiOutAll,
  customMidiOutChannel,
  setCustomMidiOutChannel,
  channelNum,
  midiOutChannel,
  setMidiOutChannel,
  presets,
  importPresets,
  modalContent,
  instrumentOn,
  setInstrumentOn,
  instrumentType,
  setInstrumentType,
  instrumentParams,
  setInstrumentParams,
  savedInstrumentParams,
  instruments,
  gainNode,
  pannerNode,
  slotNodesRef,
  rebuildEffectChain,
  grabbing,
  setGrabbing,
  tempo,
  instrumentSyncKey,
  presetsRestartTransport,
  setPresetsRestartTransport,
  midiClockIn,
  setMidiClockIn,
  midiClockOut,
  setMidiClockOut,
  ignorePresetsTempo,
  setIgnorePresetsTempo,
  presetsStopTransport,
  setPresetsStopTransport,
  channelMidiAssignments,
  setChannelMidiAssignment,
  setChannelMidiInAssignment,
  vizData,
  vizActions,
  onDockViz,
}: ModalProps) {
  const modalTypeRef = useRef<string | null>(null)

  const closeModal = useCallback(() => {
    setModalType(null)
  }, [setModalType])

  const clickScrim = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains('modal-container')) {
        closeModal()
      }
    },
    [closeModal]
  )

  useEffect(() => {
    function keydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    document.addEventListener('keydown', keydown)
    return () => {
      document.removeEventListener('keydown', keydown)
    }
  }, [closeModal])

  useEffect(() => {
    if (modalType) {
      modalTypeRef.current = modalType
    }
  }, [modalType])

  // Reflect this modal's open state in the shared counter (see isAnyModalOpen), so the
  // selection hotkeys know a per-channel modal is open even though App's modalType only
  // tracks the app-level one. Closing via Escape flushes synchronously and drops the
  // count mid-event, so useSelectionHotkeys snapshots the blocked state on the capture
  // phase (before this modal's bubble-phase close runs) — see useSelectionHotkeys.
  useEffect(() => {
    if (!modalType) return
    openModalCount++
    return () => {
      openModalCount--
    }
  }, [modalType])

  const settingsEl = useMemo(
    () => (
      <Settings
        showStepNumbers={showStepNumbers}
        setShowStepNumbers={setShowStepNumbers}
        defaultChannelModeKeybd={defaultChannelModeKeybd}
        setDefaultChannelModeKeybd={setDefaultChannelModeKeybd}
        theme={theme}
        setTheme={setTheme}
        presets={presets ?? []}
        importPresets={importPresets}
        modalType={modalType}
        presetsRestartTransport={presetsRestartTransport}
        setPresetsRestartTransport={setPresetsRestartTransport}
        midiClockIn={midiClockIn}
        setMidiClockIn={setMidiClockIn}
        midiClockOut={midiClockOut}
        setMidiClockOut={setMidiClockOut}
        ignorePresetsTempo={ignorePresetsTempo}
        setIgnorePresetsTempo={setIgnorePresetsTempo}
        presetsStopTransport={presetsStopTransport}
        setPresetsStopTransport={setPresetsStopTransport}
        channelMidiAssignments={channelMidiAssignments}
        setChannelMidiAssignment={setChannelMidiAssignment}
        setChannelMidiInAssignment={setChannelMidiInAssignment}
      />
    ),
    [
      channelMidiAssignments,
      setChannelMidiAssignment,
      setChannelMidiInAssignment,
      defaultChannelModeKeybd,
      ignorePresetsTempo,
      importPresets,
      midiClockIn,
      midiClockOut,
      modalType,
      presets,
      presetsRestartTransport,
      setDefaultChannelModeKeybd,
      setIgnorePresetsTempo,
      setMidiClockIn,
      setMidiClockOut,
      setPresetsRestartTransport,
      setShowStepNumbers,
      setPresetsStopTransport,
      setTheme,
      showStepNumbers,
      presetsStopTransport,
      theme,
    ]
  )
  const midiEl = useMemo(
    () => (
      <MIDIModal
        midiIn={midiIn}
        setMidiIn={setMidiIn}
        midiHold={midiHold}
        setMidiHold={setMidiHold}
        customMidiInChannel={customMidiInChannel}
        setCustomMidiInChannel={setCustomMidiInChannel}
        midiInChannel={midiInChannel}
        setMidiInChannel={setMidiInChannel}
        midiOutAll={midiOutAll}
        setMidiOutAll={setMidiOutAll}
        customMidiOutChannel={customMidiOutChannel}
        setCustomMidiOutChannel={setCustomMidiOutChannel}
        channelNum={channelNum}
        theme={theme}
        midiOutChannel={midiOutChannel}
        setMidiOutChannel={setMidiOutChannel}
        color={color as string}
      />
    ),
    [
      channelNum,
      color,
      customMidiInChannel,
      setCustomMidiInChannel,
      midiInChannel,
      setMidiInChannel,
      midiOutAll,
      setMidiOutAll,
      customMidiOutChannel,
      midiIn,
      setMidiIn,
      midiHold,
      midiOutChannel,
      setCustomMidiOutChannel,
      setMidiHold,
      setMidiOutChannel,
      theme,
    ]
  )
  const instrumentEl = useMemo(
    () => (
      <InstrumentModal
        key={instrumentSyncKey}
        instrumentOn={instrumentOn}
        setInstrumentOn={setInstrumentOn}
        instrumentType={instrumentType as string}
        setInstrumentType={setInstrumentType}
        instrumentParams={instrumentParams as InstrumentParams}
        setInstrumentParams={setInstrumentParams}
        savedInstrumentParams={savedInstrumentParams}
        instruments={instruments}
        gainNode={gainNode}
        pannerNode={pannerNode}
        slotNodesRef={slotNodesRef}
        rebuildEffectChain={rebuildEffectChain}
        theme={theme}
        grabbing={grabbing}
        setGrabbing={setGrabbing}
        tempo={tempo as number}
        color={color as string}
      />
    ),
    [
      color,
      slotNodesRef,
      rebuildEffectChain,
      gainNode,
      pannerNode,
      grabbing,
      instrumentOn,
      instrumentParams,
      instrumentSyncKey,
      savedInstrumentParams,
      instrumentType,
      instruments,
      setGrabbing,
      setInstrumentOn,
      setInstrumentParams,
      setInstrumentType,
      theme,
      tempo,
    ]
  )
  const aboutEl = useMemo(() => <AboutModal theme={theme} />, [theme])
  const vizEl = useMemo(
    () => (vizData ? <VizModal data={vizData} actions={vizActions} /> : null),
    [vizData, vizActions]
  )

  return (
    <div className="modal-container" ref={nodeRef} onClick={clickScrim}>
      <div className={classNames('modal-window', { 'viz-window': modalTypeRef.current === 'visualizer' })}>
        <div className="modal-header">
          <div className="modal-title">
            <p>{modalTypeRef.current}</p>
            {(modalTypeRef.current === 'instrument' || modalTypeRef.current === 'visualizer') && scribbler && (
              <span className="modal-channel-name" style={{ color }}>
                {scribbler}
              </span>
            )}
          </div>
          <div className="modal-close" onClick={closeModal}></div>
          {modalTypeRef.current === 'visualizer' && onDockViz && (
            // "restore down": swap the visualizer out of the window, docked below its channel
            <div className="modal-dock" onClick={onDockViz} title="Dock below channel">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="4" y="9" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="2" />
                <path d="M9 4.5h10.5V15" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          )}
        </div>
        <div className="modal-content">
          {modalTypeRef.current === 'settings' && modalContent && settingsEl}
          {modalTypeRef.current === 'MIDI' && modalContent && midiEl}
          {modalTypeRef.current === 'instrument' && modalContent && instrumentEl}
          {modalTypeRef.current === 'about' && modalContent && aboutEl}
          {modalTypeRef.current === 'visualizer' && modalContent && vizEl}
        </div>
      </div>
    </div>
  )
}
