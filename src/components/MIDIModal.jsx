import React, { useCallback, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import MidiInputMode from './MidiInputMode'

import './MIDIModal.scss'

export default function MIDIModal({ midiHold, setMidiHold, theme }) {
  return (
    <div className="midi-modal">
      <MidiInputMode midiHold={midiHold} setMidiHold={setMidiHold} theme={theme} />
    </div>
  )
}
MIDIModal.propTypes = {
  midiHold: PropTypes.bool,
  setMidiHold: PropTypes.func,
  theme: PropTypes.string,
}
