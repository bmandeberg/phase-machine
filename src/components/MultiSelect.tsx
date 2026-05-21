import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import classNames from 'classnames'
import './MultiSelect.scss'

interface MultiSelectProps {
  options: string[]
  values: string[]
  setValues: React.Dispatch<React.SetStateAction<string[]>>
  placeholder?: string
}

export default function MultiSelect({ options, setValues, values, placeholder }: MultiSelectProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const multiSelectRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setDropdownOpen((dropdownOpen) => !dropdownOpen)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (multiSelectRef.current && !multiSelectRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const addValue = useCallback(
    (value: string) => {
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
    (e: React.MouseEvent, value: string) => {
      e.stopPropagation()
      setValues((values) => values.filter((v) => v !== value))
    },
    [setValues]
  )

  const stopPropagation = useCallback((e: React.MouseEvent) => {
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
