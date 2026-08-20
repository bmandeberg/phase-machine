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

  const steps = useMemo(
    () =>
      [...Array(seqLength)].map((_d, i) => (
        <div
          className={classNames('sequence-step', {
            selected: seqSteps[i],
            previewed: showSeqPreview && seqPreview?.[i],
            playing: playingStep === i,
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
      <div className="sequencer-container">{steps}</div>
      {children}
    </div>
  )
}
