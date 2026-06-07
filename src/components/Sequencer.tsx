import React, { useCallback, useEffect, useMemo, useRef } from 'react'
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
  // Click-drag painting: mousedown toggles the first step and records its new
  // value; dragging over subsequent steps paints that same value across them.
  const dragging = useRef(false)
  const paintValue = useRef(false)

  const handleStepMouseDown = useCallback(
    (e: React.MouseEvent, i: number) => {
      if (e.button !== 0) return // left-click only
      e.preventDefault() // avoid text/drag selection while painting
      const newVal = !seqSteps[i]
      paintValue.current = newVal
      dragging.current = true
      setSeqSteps((seq) => {
        const seqCopy = seq.slice()
        seqCopy[i] = newVal
        return seqCopy
      })
    },
    [seqSteps, setSeqSteps]
  )

  const handleStepMouseEnter = useCallback(
    (i: number) => {
      if (!dragging.current) return
      setSeqSteps((seq) => {
        if (seq[i] === paintValue.current) return seq
        const seqCopy = seq.slice()
        seqCopy[i] = paintValue.current
        return seqCopy
      })
    },
    [setSeqSteps]
  )

  // End the drag wherever the mouse is released (even outside the steps).
  useEffect(() => {
    const stopDragging = () => {
      dragging.current = false
    }
    window.addEventListener('mouseup', stopDragging)
    return () => window.removeEventListener('mouseup', stopDragging)
  }, [])

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
          onMouseDown={(e) => handleStepMouseDown(e, i)}
          onMouseEnter={() => handleStepMouseEnter(i)}
          key={i}>
          {showStepNumbers && i + 1}
        </div>
      )),
    [
      playingStep,
      seqLength,
      seqSteps,
      seqPreview,
      showSeqPreview,
      showStepNumbers,
      handleStepMouseDown,
      handleStepMouseEnter,
    ]
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
