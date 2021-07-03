import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './MultiSelect.scss'

export default function MultiSelect({ options, setValues, values, placeholder }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const multiSelectRef = useRef()

  const toggleDropdown = useCallback((e) => {
    e.stopPropagation()
    setDropdownOpen((dropdownOpen) => !dropdownOpen)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (multiSelectRef.current && !multiSelectRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
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
    (e, value) => {
      e.stopPropagation()
      setValues((values) => values.filter((v) => v !== value))
    },
    [setValues]
  )

  const stopPropagation = useCallback((e) => {
    e.stopPropagation()
  }, [])

  const placeholderEl = useMemo(() => <p className="multi-select-placeholder">{placeholder}</p>, [placeholder])
  const noOptionsEl = useMemo(() => <div className="multi-select-option">No options</div>, [])

  return (
    <div ref={multiSelectRef} className="multi-select">
      <div onClick={toggleDropdown} className="multi-select-control">
        <div className="multi-select-selections">
          {values.map((value, i) => (
            <div key={i} className="multi-select-selection">
              <div onClick={(e) => removeValue(e, value)} className="multi-select-remove"></div>
              <div onClick={stopPropagation} className="multi-select-value">
                {value}
              </div>
            </div>
          ))}
          {!values.length && placeholderEl}
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
        {!options.length && noOptionsEl}
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
