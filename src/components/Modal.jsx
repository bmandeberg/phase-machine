import React, { useCallback, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import Settings from './Settings'
import MIDIModal from './MIDIModal'
import InstrumentModal from './InstrumentModal'
import './Modal.scss'

export default function Modal({
  modalType,
  setModalType,
  showStepNumbers,
  setShowStepNumbers,
  linearKnobs,
  setLinearKnobs,
  hotkeyRestart,
  setHotkeyRestart,
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
    window.addEventListener('keydown', keydown)
    return () => {
      window.removeEventListener('keydown', keydown)
    }
  }, [closeModal])

  useEffect(() => {
    if (modalType) {
      modalTypeRef.current = modalType
    }
  }, [modalType])

  return (
    <div className="modal-container">
      <div className="modal-buffer">
        <div className="modal-window">
          <div className="modal-header">
            <p>{modalTypeRef.current}</p>
            <div className="modal-close" onClick={closeModal}></div>
          </div>
          <div className="modal-content">
            {modalTypeRef.current === 'settings' && modalContent && (
              <Settings
                showStepNumbers={showStepNumbers}
                setShowStepNumbers={setShowStepNumbers}
                linearKnobs={linearKnobs}
                setLinearKnobs={setLinearKnobs}
                hotkeyRestart={hotkeyRestart}
                setHotkeyRestart={setHotkeyRestart}
                defaultChannelModeKeybd={defaultChannelModeKeybd}
                setDefaultChannelModeKeybd={setDefaultChannelModeKeybd}
                theme={theme}
                setTheme={setTheme}
                presets={presets}
                importPresets={importPresets}
                modalType={modalType}
              />
            )}
            {modalTypeRef.current === 'MIDI' && modalContent && (
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
            )}
            {modalTypeRef.current === 'instrument' && modalContent && (
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
            )}
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
  hotkeyRestart: PropTypes.bool,
  setHotkeyRestart: PropTypes.func,
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
}
