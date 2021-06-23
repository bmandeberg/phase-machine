import React, { useState, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './MultiSelect.scss'

export default function MultiSelect({ options, setValues, values, placeholder }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleDropdown = useCallback((e) => {
    e.stopPropagation()
    setDropdownOpen((dropdownOpen) => !dropdownOpen)
  }, [])

  const addValue = useCallback(
    (value) => {
      if (!values.includes(value)) {
        setValues((values) => {
          const valuesCopy = values.slice()
          valuesCopy.push(value)
          return valuesCopy
        })
      }
    },
    [setValues, values]
  )

  const removeValue = useCallback(
    (value) => {
      setValues((values) => values.filter((v) => v !== value))
    },
    [setValues]
  )

  return (
    <div className="multi-select">
      <div onClick={toggleDropdown} className="multi-select-control">
        <div className="multi-select-selections">
          {values.map((value, i) => (
            <div key={i} className="multi-select-selection">
              <div onClick={() => removeValue(value)} className="multi-select-remove"></div>
              <div className="multi-select-value">{value}</div>
            </div>
          ))}
          {!values.length && <p className="multi-select-placeholder">{placeholder}</p>}
        </div>
        <div onClick={toggleDropdown} className="multi-select-arrow-container">
          <div className="multi-select-arrow"></div>
        </div>
      </div>
      <div className={classNames('multi-select-dropdown', { 'dropdown-open': dropdownOpen })}>
        {options.map((option, i) => (
          <div key={i} onClick={() => addValue(option)} className="multi-select-option">
            {option}
          </div>
        ))}
        {!options.length && <div className="multi-select-option">No options</div>}
      </div>
    </div>
  )
}
MultiSelect.propTypes = {
  options: PropTypes.array,
  values: PropTypes.array,
  setValues: PropTypes.func,
  placeholder: PropTypes.string,
}
