import React, { useCallback, useRef, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import Settings from './Settings'
import MIDIModal from './MIDIModal'
import InstrumentModal from './InstrumentModal'
import AboutModal from './AboutModal'
import classNames from 'classnames'
import './Modal.scss'

export default function Modal({
  modalType,
  setModalType,
  showStepNumbers,
  setShowStepNumbers,
  linearKnobs,
  setLinearKnobs,
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
}) {
  const modalTypeRef = useRef()

  const closeModal = useCallback(() => {
    setModalType(null)
  }, [setModalType])

  useEffect(() => {
    function keydown(e) {
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
        linearKnobs={linearKnobs}
        setLinearKnobs={setLinearKnobs}
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
      />
    ),
    [
      defaultChannelModeKeybd,
      ignorePresetsTempo,
      importPresets,
      linearKnobs,
      midiClockIn,
      midiClockOut,
      modalType,
      presets,
      presetsRestartTransport,
      setDefaultChannelModeKeybd,
      setIgnorePresetsTempo,
      setLinearKnobs,
      setMidiClockIn,
      setMidiClockOut,
      setPresetsRestartTransport,
      setShowStepNumbers,
      setTheme,
      showStepNumbers,
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
        effects={effects}
        theme={theme}
        grabbing={grabbing}
        setGrabbing={setGrabbing}
        linearKnobs={linearKnobs}
      />
    ),
    [
      effects,
      grabbing,
      instrumentOn,
      instrumentParams,
      instrumentType,
      instruments,
      linearKnobs,
      setGrabbing,
      setInstrumentOn,
      setInstrumentParams,
      setInstrumentType,
      theme,
    ]
  )
  const aboutEl = useMemo(() => <AboutModal theme={theme} />, [theme])

  return (
    <div className="modal-container">
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
Modal.propTypes = {
  modalContent: PropTypes.bool,
  modalType: PropTypes.string,
  setModalType: PropTypes.func,
  showStepNumbers: PropTypes.bool,
  setShowStepNumbers: PropTypes.func,
  linearKnobs: PropTypes.bool,
  setLinearKnobs: PropTypes.func,
  defaultChannelModeKeybd: PropTypes.bool,
  setDefaultChannelModeKeybd: PropTypes.func,
  theme: PropTypes.string,
  setTheme: PropTypes.func,
  midiHold: PropTypes.bool,
  setMidiHold: PropTypes.func,
  customMidiOutChannel: PropTypes.bool,
  setCustomMidiOutChannel: PropTypes.func,
  channelNum: PropTypes.number,
  midiOutChannel: PropTypes.number,
  setMidiOutChannel: PropTypes.func,
  presets: PropTypes.array,
  importPresets: PropTypes.func,
  instrumentOn: PropTypes.bool,
  setInstrumentOn: PropTypes.func,
  instrumentType: PropTypes.string,
  setInstrumentType: PropTypes.func,
  instrumentParams: PropTypes.object,
  setInstrumentParams: PropTypes.func,
  instruments: PropTypes.object,
  effects: PropTypes.object,
  grabbing: PropTypes.bool,
  setGrabbing: PropTypes.func,
  presetsRestartTransport: PropTypes.bool,
  setPresetsRestartTransport: PropTypes.func,
  midiClockIn: PropTypes.bool,
  setMidiClockIn: PropTypes.func,
  midiClockOut: PropTypes.bool,
  setMidiClockOut: PropTypes.func,
  ignorePresetsTempo: PropTypes.bool,
  setIgnorePresetsTempo: PropTypes.func,
}
