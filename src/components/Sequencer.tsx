import React, { useCallback, useEffect, useMemo } from 'react'
import classNames from 'classnames'

import './Sequencer.scss'

interface SequencerProps {
  className?: string
  seqSteps: boolean[]
  setSeqSteps: React.Dispatch<React.SetStateAction<boolean[]>>
  seqLength: number
  seqPreview?: boolean[]
  showSeqPreview?: boolean
  playingStep?: number
  children?: React.ReactNode
  showStepNumbers?: boolean
  longestSequence?: number
}

export default function Sequencer({
  className,
  seqSteps,
  setSeqSteps,
  seqLength,
  seqPreview,
  showSeqPreview,
  playingStep,
  children,
  showStepNumbers,
  longestSequence,
}: SequencerProps) {
  const updateSeq = useCallback(
    (i: number) => {
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

  const steps = useMemo(
    () =>
      [...Array(seqLength)].map((_d, i) => (
        <div
          className={classNames('sequence-step', {
            selected: seqSteps[i],
            previewed: showSeqPreview && seqPreview?.[i],
            playing: playingStep === i,
            hidden: i >= seqLength,
          })}
          onClick={() => updateSeq(i)}
          key={i}>
          {showStepNumbers && i + 1}
        </div>
      )),
    [playingStep, seqLength, seqSteps, seqPreview, showSeqPreview, showStepNumbers, updateSeq]
  )

  return (
    <div className={classNames('sequencer', className)}>
      <div
        className="sequencer-container"
        style={
          { width: longestSequence && longestSequence > seqLength && (22 + 18) * longestSequence + 'px' } as React.CSSProperties
        }>
        {steps}
      </div>
      {children}
    </div>
  )
}
