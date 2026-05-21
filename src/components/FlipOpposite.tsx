import React, { useCallback } from 'react'
import './FlipOpposite.scss'

interface FlipOppositeProps {
  flip?: () => void
  previewFlip?: () => void
  opposite?: () => void
  previewOpposite?: () => void
  setShowKeyPreview?: (show: boolean) => void
}

export default function FlipOpposite({
  flip,
  previewFlip,
  opposite,
  previewOpposite,
  setShowKeyPreview,
}: FlipOppositeProps) {
  const hideKeyPreview = useCallback(() => {
    setShowKeyPreview?.(false)
  }, [setShowKeyPreview])

  return (
    <div className="flip-opposite channel-module stacked-buttons">
      <div className="button" onClick={opposite} onMouseOver={previewOpposite} onMouseOut={hideKeyPreview}>
        Opposite
      </div>
      <div className="button" onClick={flip} onMouseOver={previewFlip} onMouseOut={hideKeyPreview}>
        Flip
      </div>
    </div>
  )
}
