import React, { useCallback, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import Settings from './Settings'
import './Modal.scss'

export default function Modal({
  modalType,
  setModalType,
  showStepNumbers,
  setShowStepNumbers,
  separateMIDIChannels,
  setSeparateMIDIChannels,
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
                separateMIDIChannels={separateMIDIChannels}
                setSeparateMIDIChannels={setSeparateMIDIChannels}
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
  separateMIDIChannels: PropTypes.bool,
  setSeparateMIDIChannels: PropTypes.func,
  showStepNumbers: PropTypes.bool,
  setShowStepNumbers: PropTypes.func,
}
