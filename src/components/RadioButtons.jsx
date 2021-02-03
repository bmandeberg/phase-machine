import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './RadioButtons.scss'

export default function RadioButtons(props) {
  return (
    <div className={classNames('radio-buttons-container', props.className)}>
      <div className="radio-buttons">
        {props.options.map((option) => (
          <div
            className={classNames('radio-button', { 'radio-button-selected': props.selected === option })}
            onClick={() => props.setSelected(option)}
            key={option}>
            {option}
          </div>
        ))}
      </div>
      <p className="radio-buttons radio-buttons-label no-select">{props.label}</p>
    </div>
  )
}
RadioButtons.propTypes = {
  className: PropTypes.string,
  options: PropTypes.array,
  selected: PropTypes.string,
  setSelected: PropTypes.func,
  label: PropTypes.string,
}
