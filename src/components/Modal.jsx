import React, { useCallback, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import Settings from './Settings'
import MIDIModal from './MIDIModal'
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
}) {
  const modalTypeRef = useRef()

  const closeModal = useCallback(() => {
    setModalType(null)
  }, [setModalType])

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
            {modalTypeRef.current === 'settings' && (
              <Settings
                showStepNumbers={showStepNumbers}
                setShowStepNumbers={setShowStepNumbers}
                linearKnobs={linearKnobs}
                setLinearKnobs={setLinearKnobs}
                hotkeyRestart={hotkeyRestart}
                setHotkeyRestart={setHotkeyRestart}
                theme={theme}
                setTheme={setTheme}
                presets={presets}
                importPresets={importPresets}
                modalType={modalType}
              />
            )}
            {modalTypeRef.current === 'MIDI' && (
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
          </div>
        </div>
      </div>
    </div>
  )
}
Modal.propTypes = {
  modalType: PropTypes.string,
  setModalType: PropTypes.func,
  showStepNumbers: PropTypes.bool,
  setShowStepNumbers: PropTypes.func,
  linearKnobs: PropTypes.bool,
  setLinearKnobs: PropTypes.func,
  hotkeyRestart: PropTypes.bool,
  setHotkeyRestart: PropTypes.func,
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
}
