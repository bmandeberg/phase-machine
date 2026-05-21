import React, { useCallback, useRef, useEffect, useMemo } from 'react'
import Settings from './Settings'
import MIDIModal from './MIDIModal'
import InstrumentModal from './InstrumentModal'
import AboutModal from './AboutModal'
import classNames from 'classnames'
import { InstrumentParams, Preset } from '../types'
import './Modal.scss'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ModalProps {
  modalContent?: boolean
  modalType?: string | null
  setModalType: (type: string | null) => void
  showStepNumbers?: boolean
  setShowStepNumbers: any
  defaultChannelModeKeybd?: boolean
  setDefaultChannelModeKeybd: any
  theme: string
  setTheme: any
  midiHold?: boolean
  setMidiHold: any
  customMidiOutChannel?: boolean
  setCustomMidiOutChannel: any
  channelNum?: number
  midiOutChannel?: number
  setMidiOutChannel: any
  presets: Preset[]
  importPresets: any
  instrumentOn?: boolean
  setInstrumentOn: any
  instrumentType: string
  setInstrumentType: any
  instrumentParams: InstrumentParams
  setInstrumentParams: any
  instruments: any
  gainNode: any
  effects: any
  grabbing?: boolean
  setGrabbing: any
  presetsRestartTransport?: boolean
  setPresetsRestartTransport: any
  midiClockIn?: boolean
  setMidiClockIn: any
  midiClockOut?: boolean
  setMidiClockOut: any
  ignorePresetsTempo?: boolean
  setIgnorePresetsTempo: any
  presetsStopTransport?: boolean
  setPresetsStopTransport: any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function Modal({
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
  instruments,
  gainNode,
  effects,
  grabbing,
  setGrabbing,
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
        presets={presets}
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
        midiHold={midiHold}
        setMidiHold={setMidiHold}
        customMidiOutChannel={customMidiOutChannel}
        setCustomMidiOutChannel={setCustomMidiOutChannel}
        channelNum={channelNum}
        theme={theme}
        midiOutChannel={midiOutChannel}
        setMidiOutChannel={setMidiOutChannel}
      />
    ),
    [
      channelNum,
      customMidiOutChannel,
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
        instrumentOn={instrumentOn}
        setInstrumentOn={setInstrumentOn}
        instrumentType={instrumentType}
        setInstrumentType={setInstrumentType}
        instrumentParams={instrumentParams}
        setInstrumentParams={setInstrumentParams}
        instruments={instruments}
        gainNode={gainNode}
        effects={effects}
        theme={theme}
        grabbing={grabbing}
        setGrabbing={setGrabbing}
      />
    ),
    [
      effects,
      gainNode,
      grabbing,
      instrumentOn,
      instrumentParams,
      instrumentType,
      instruments,
      setGrabbing,
      setInstrumentOn,
      setInstrumentParams,
      setInstrumentType,
      theme,
    ]
  )
  const aboutEl = useMemo(() => <AboutModal theme={theme} />, [theme])

  return (
    <div className="modal-container" onClick={clickScrim}>
      <div className={classNames('modal-buffer', { 'small-buffer': modalTypeRef.current === 'about' })}>
        <div className="modal-window">
          <div className="modal-header">
            <p>{modalTypeRef.current}</p>
            <div className="modal-close" onClick={closeModal}></div>
          </div>
          <div className={classNames('modal-content', { 'full-modal': modalTypeRef.current === 'about' })}>
            {modalTypeRef.current === 'settings' && modalContent && settingsEl}
            {modalTypeRef.current === 'MIDI' && modalContent && midiEl}
            {modalTypeRef.current === 'instrument' && modalContent && instrumentEl}
            {modalTypeRef.current === 'about' && modalContent && aboutEl}
          </div>
        </div>
      </div>
    </div>
  )
}
