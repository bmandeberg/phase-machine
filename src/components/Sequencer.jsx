import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './Sequencer.scss'

export default function Sequencer({ className, seqSteps, setSeqSteps, seqLength, playingStep }) {
  const updateSeq = useCallback(
    (i) => {
      setSeqSteps((seq) => {
        const seqCopy = seq.slice()
        seqCopy[i] = !seqCopy[i]
        return seqCopy
      })
    },
    [setSeqSteps]
  )

  return (
    <div className={classNames('sequencer', className)}>
      <div className="sequencer-container">
        {[...Array(seqLength)].map((d, i) => (
          <div
            className={classNames('sequence-step', {
              selected: seqSteps[i],
              playing: playingStep === i,
            })}
            onClick={() => updateSeq(i)}></div>
        ))}
      </div>
    </div>
  )
}
Sequencer.propTypes = {
  className: PropTypes.string,
  seqSteps: PropTypes.array,
  setSeqSteps: PropTypes.func,
  seqLength: PropTypes.number,
  playingStep: PropTypes.number,
}
