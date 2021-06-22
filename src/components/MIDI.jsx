import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './MIDI.scss'

export default function MIDI({ midiIn, setMidiIn, openMidiModal }) {
  const toggleMidiIn = useCallback(() => {
    setMidiIn((midiIn) => !midiIn)
  }, [setMidiIn])

  return (
    <div className="midi">
      <div onClick={openMidiModal} className="button midi-modal">
        MIDI
      </div>
      <div onClick={toggleMidiIn} className={classNames('button midi-in', { 'midi-active': midiIn })}>
        In
      </div>
    </div>
  )
}
MIDI.propTypes = {
  midiIn: PropTypes.bool,
  setMidiIn: PropTypes.func,
  openMidiModal: PropTypes.func,
}
