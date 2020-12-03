import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import NumericInput from 'react-numeric-input'
import './NumInput.scss'

export default function NumInput(props) {
  const input = useRef()

  useEffect(() => {
    const inputEl = input.current.querySelector('input')
    inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length)
  }, [props.value])

  return (
    <div ref={input} className={classNames('num-input', props.className)}>
      <NumericInput
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(value) => {
          props.setValue(value)
        }}
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
  format: PropTypes.func,
}
