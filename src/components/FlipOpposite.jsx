import React from 'react'
import PropTypes from 'prop-types'
import './FlipOpposite.scss'

export default function FlipOpposite({ flip, opposite }) {
  return (
    <div className="flip-opposite channel-module">
      <div className="button no-select" onClick={flip}>
        Flip
      </div>
      <div className="button no-select" onClick={opposite}>
        Opposite
      </div>
    </div>
  )
}
FlipOpposite.propTypes = {
  flip: PropTypes.func,
  opposite: PropTypes.func,
}
