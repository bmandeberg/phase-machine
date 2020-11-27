import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import NumericInput from 'react-numeric-input'
import './NumInput.scss'

export default function NumInput(props) {
  return (
    <div className={classNames('num-input small-num-input', props.className)}>
      <NumericInput
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(value) => props.setValue(value)}
        style={false}
        strict
      />
      <p className="num-input-label">{props.label.toUpperCase()}</p>
    </div>
  )
}
NumInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  setValue: PropTypes.func,
  className: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
}
