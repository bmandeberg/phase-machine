import React, { useCallback, useRef, useEffect, useMemo } from 'react'
import Settings from './Settings'
import MIDIModal from './MIDIModal'
import InstrumentModal from './InstrumentModal'
import AboutModal from './AboutModal'
import { InstrumentParams, Preset } from '../types'
import './Modal.scss'

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
      />
    ),
    [
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

  return (
    <div className="modal-container" ref={nodeRef} onClick={clickScrim}>
      <div className="modal-window">
        <div className="modal-header">
          <div className="modal-title">
            <p>{modalTypeRef.current}</p>
            {modalTypeRef.current === 'instrument' && scribbler && (
              <span className="modal-channel-name" style={{ color }}>
                {scribbler}
              </span>
            )}
          </div>
          <div className="modal-close" onClick={closeModal}></div>
        </div>
        <div className="modal-content">
          {modalTypeRef.current === 'settings' && modalContent && settingsEl}
          {modalTypeRef.current === 'MIDI' && modalContent && midiEl}
          {modalTypeRef.current === 'instrument' && modalContent && instrumentEl}
          {modalTypeRef.current === 'about' && modalContent && aboutEl}
        </div>
      </div>
    </div>
  )
}
