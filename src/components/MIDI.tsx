import React, { useCallback } from 'react'
import classNames from 'classnames'
import './MIDI.scss'

interface MIDIProps {
  // midiIn is part of the Channel domain type as boolean | string; this toggle only reads its truthiness.
  midiIn?: boolean | string
  setMidiIn: React.Dispatch<React.SetStateAction<boolean | string>>
  openMidiModal?: () => void
}

export default function MIDI({ midiIn, setMidiIn, openMidiModal }: MIDIProps) {
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
