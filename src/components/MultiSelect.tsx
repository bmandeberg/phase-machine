import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import classNames from 'classnames'
import './MultiSelect.scss'

const OPTION_HEIGHT = 27

interface MultiSelectProps {
  options: string[]
  values: string[]
  setValues: React.Dispatch<React.SetStateAction<string[]>>
  placeholder?: string
  container?: string
}

export default function MultiSelect({ options, setValues, values, placeholder, container }: MultiSelectProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [menuAbove, setMenuAbove] = useState(false)
  const [dropdownWidth, setDropdownWidth] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const multiSelectRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef(container)

  const menuHeight = useMemo(() => Math.min(Math.max(options.length, 1) * OPTION_HEIGHT, 200), [options.length])

  const toggleDropdown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (multiSelectRef.current) {
        const rect = multiSelectRef.current.getBoundingClientRect()
        setDropdownWidth(multiSelectRef.current.clientWidth)
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        setMenuAbove(spaceBelow < menuHeight && spaceAbove > spaceBelow)
      }
      setDropdownOpen((dropdownOpen) => !dropdownOpen)
    },
    [menuHeight]
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (multiSelectRef.current && !multiSelectRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    function handleScroll() {
      const el = document.querySelector(containerRef.current as string)
      if (el) setScrollTop(el.scrollTop)
    }
    document.addEventListener('mousedown', handleClickOutside)
    const containerVar = containerRef.current
    const scrollContainer = containerVar ? document.querySelector(containerVar) : null
    if (containerVar && scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (containerVar && scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
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

  const wrapperStyle = useMemo<React.CSSProperties>(() => {
    const top = menuAbove ? menuHeight * -1 + 2 + 'px' : '100%'
    return container ? { top: `calc(${top} - ${scrollTop}px)` } : { top }
  }, [container, menuAbove, menuHeight, scrollTop])
  const menuStyle = useMemo<React.CSSProperties | undefined>(
    () => (container ? { width: dropdownWidth } : undefined),
    [container, dropdownWidth]
  )

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
      <div
        className={classNames('multi-select-dropdown-wrapper', { 'dropdown-open': dropdownOpen, 'menu-above': menuAbove })}
        style={wrapperStyle}>
        <div className={classNames('multi-select-dropdown', { 'fixed-menu': container })} style={menuStyle}>
          {options.map((option, i) => (
            <div key={i} onClick={() => addValue(option)} className="multi-select-option">
              {option}
            </div>
          ))}
          {!options.length && noOptionsEl}
        </div>
      </div>
    </div>
  )
}
