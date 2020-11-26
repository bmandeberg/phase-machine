import React from 'react'
import PropTypes from 'prop-types'
import NumericInput from 'react-numeric-input'
import './NumInput.scss'

export default function NumInput(props) {
  return (
    <div className="num-input small-num-input">
      {/* eslint-disable-next-line react/style-prop-object */}
      <NumericInput value={props.value} onChange={(value) => props.setValue(value)} style={false} strict />
      <p>{props.label.toUpperCase()}</p>
    </div>
  )
}
NumInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  setValue: PropTypes.func,
}
