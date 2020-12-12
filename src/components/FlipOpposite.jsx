import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import './FlipOpposite.scss'

export default function FlipOpposite({ flip, previewFlip, opposite, previewOpposite, setShowKeyPreview }) {
  const hideKeyPreview = useCallback(() => {
    setShowKeyPreview(false)
  }, [setShowKeyPreview])

  return (
    <div className="flip-opposite channel-module">
      <div className="button" onClick={flip} onMouseOver={previewFlip} onMouseOut={hideKeyPreview}>
        Flip
      </div>
      <div className="button" onClick={opposite} onMouseOver={previewOpposite} onMouseOut={hideKeyPreview}>
        Opposite
      </div>
    </div>
  )
}
FlipOpposite.propTypes = {
  flip: PropTypes.func,
  previewFlip: PropTypes.func,
  opposite: PropTypes.func,
  previewOpposite: PropTypes.func,
  setShowKeyPreview: PropTypes.func,
}
