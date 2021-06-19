import React, { useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { MAX_SEQUENCE_LENGTH } from '../globals'

import './Sequencer.scss'

export default function Sequencer({
  className,
  seqSteps,
  setSeqSteps,
  seqLength,
  playingStep,
  children,
  showStepNumbers,
}) {
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

  useEffect(() => {
    setSeqSteps((seqSteps) => {
      return seqSteps.map((s, i) => (i + 1 > seqLength ? false : s))
    })
  }, [seqLength, setSeqSteps])

  return (
    <div className={classNames('sequencer', className)}>
      <div className="sequencer-container">
        {[...Array(MAX_SEQUENCE_LENGTH)].map((d, i) => (
          <div
            className={classNames('sequence-step', {
              selected: seqSteps[i],
              playing: playingStep === i,
              hidden: i >= seqLength,
            })}
            onClick={() => updateSeq(i)}
            key={i}>
            {showStepNumbers && i + 1}
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}
Sequencer.propTypes = {
  className: PropTypes.string,
  seqSteps: PropTypes.array,
  setSeqSteps: PropTypes.func,
  seqLength: PropTypes.number,
  playingStep: PropTypes.number,
  children: PropTypes.node,
  showStepNumbers: PropTypes.bool,
}
