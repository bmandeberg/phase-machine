import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import classNames from 'classnames'
import NumInput from './NumInput'
import { v4 as uuid } from 'uuid'
import './Dropdown.scss'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DropdownOption = any

interface DropdownProps {
  label?: string
  className?: string
  options: DropdownOption[]
  setValue: (value: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  value?: string | number | null
  placeholder?: string
  noOptions?: string
  small?: boolean
  noTextTransform?: boolean
  capitalize?: boolean
  inline?: boolean
  num1?: number
  setNum1?: (value: number) => void
  num2?: number
  setNum2?: (value: number) => void
  showNumInputs?: boolean
  container?: string
  minWidth?: number
  gridColumns?: number
}

function longestText(options: DropdownOption[], graphicOptions: boolean) {
  if (graphicOptions) {
    return '-----'
  }
  if (options.length) {
    let longestOption = ''
    for (let i = 0; i < options.length; i++) {
      // labels are strings on plain options and on { value, label } options; dividers and
      // grid gaps carry no text and are skipped.
      const label = typeof options[i] === 'object' ? options[i].label : options[i]
      if (typeof label !== 'string') continue
      const option = label.trim()
      if (option.length > longestOption.length) {
        longestOption = option
      }
    }
    return longestOption
  }
  return null
}

export default function Dropdown({
  label,
  className,
  options,
  setValue,
  value,
  placeholder,
  noOptions,
  small,
  noTextTransform,
  capitalize,
  inline,
  num1,
  setNum1,
  num2,
  setNum2,
  showNumInputs,
  container,
  minWidth,
  gridColumns,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [menuAbove, setMenuAbove] = useState(false)
  // viewport coords + width for the fixed (container-mode) menu, from the control's rect
  const [fixedPos, setFixedPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const controlRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // graphic when any option carries a React element label (icons) — checked across
  // all options, not just the first, so a leading heading/divider doesn't mask it
  const graphicOptions = useMemo(
    () => options.some((o) => typeof o === 'object' && React.isValidElement(o.label)),
    [options]
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const optionHeight = useMemo(() => (small ? 20 : 27), [small])

  // In grid mode the menu is `gridColumns` wide, so its height is driven by the row
  // count, not the total option count. Headings/dividers span a full row (and force
  // the next item onto a fresh row), so walk the options to count rows accurately.
  const menuRows = useMemo(() => {
    if (!gridColumns) return options.length
    let rows = 0
    let col = 0
    for (const o of options) {
      const fullWidth = typeof o === 'object' && (o.heading || o.divider)
      if (fullWidth) {
        if (col > 0) rows++ // finish the partial icon row before the full-width row
        rows++
        col = 0
      } else if (++col === gridColumns) {
        rows++
        col = 0
      }
    }
    if (col > 0) rows++
    return rows
  }, [gridColumns, options])
  const menuHeight = useMemo(
    () => Math.min(menuRows * optionHeight, gridColumns ? 400 : 200),
    [menuRows, optionHeight, gridColumns]
  )

  // Decide above/below and, for container (fixed) menus, the viewport position — measured
  // from the control's rect so the menu tracks the control through the modal's inner scroll
  // and window resize. position: fixed is viewport-relative here (no transformed modal
  // ancestor), so the rect's viewport coords are exactly where the menu should sit.
  const computePlacement = useCallback(() => {
    // measure the visible control box (not the outer container, which also holds the hidden
    // min-width spacer below it — that would push the menu down by the spacer's height)
    const el = controlRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const above = rect.bottom + menuHeight > window.innerHeight && rect.top > window.innerHeight - rect.bottom
    setMenuAbove(above)
    if (container) {
      setFixedPos({ top: above ? rect.top - menuHeight : rect.bottom, left: rect.left, width: rect.width })
    }
  }, [container, menuHeight])

  const toggleOpen = useCallback(() => {
    if (!open) computePlacement()
    setOpen((open) => !open)
  }, [computePlacement, open])

  // While a container menu is open, keep it pinned to the control as the modal's inner
  // content scrolls or the window resizes (the menu is fixed-positioned, so it won't track
  // on its own). Non-container menus scroll with their absolute wrapper and need none.
  useEffect(() => {
    if (!open || !container) return
    const scrollEl = document.querySelector(container)
    const reposition = () => computePlacement()
    scrollEl?.addEventListener('scroll', reposition)
    window.addEventListener('resize', reposition)
    return () => {
      scrollEl?.removeEventListener('scroll', reposition)
      window.removeEventListener('resize', reposition)
    }
  }, [open, container, computePlacement])

  const selectedIndex = useMemo(
    () => options.findIndex((option) => (typeof option === 'object' ? option.value === value : option === value)),
    [options, value]
  )

  const displayValue = useMemo(
    () =>
      selectedIndex !== -1 && typeof options[selectedIndex] === 'object'
        ? options[selectedIndex].label
        : options[selectedIndex],
    [options, selectedIndex]
  )

  useEffect(() => {
    if (open && !gridColumns) {
      if (selectedIndex !== -1) {
        menuRef.current?.scroll({ top: selectedIndex * optionHeight })
      }
    }
  }, [open, optionHeight, selectedIndex, gridColumns])

  const optionEls = useMemo(
    () =>
      options.length ? (
        options.map((option) => {
          // A full-width section heading between grid groups (non-interactive).
          if (typeof option === 'object' && option.heading) {
            return (
              <div key={uuid()} className="dropdown-heading">
                {option.heading}
              </div>
            )
          }
          // A full-width divider between grid sections (non-interactive).
          if (typeof option === 'object' && option.divider) {
            return <div key={uuid()} className="dropdown-divider" />
          }
          const optionValue = typeof option === 'object' ? option.value : option
          const optionLabel = typeof option === 'object' ? option.label : option
          // An empty-string option is a grid gap (a cell with no rate) — render a
          // non-interactive placeholder so the grid columns stay aligned.
          if (optionValue === '') {
            return <div key={uuid()} className="dropdown-option dropdown-option-empty" />
          }
          return (
            <div
              key={uuid()}
              onClick={() => {
                setValue(optionValue === '(None)' ? null : optionValue)
                setOpen(false)
              }}
              className={classNames('dropdown-option', { selected: optionValue === value })}>
              {optionLabel}
            </div>
          )
        })
      ) : (
        <div className="no-options">{noOptions || 'No options found'}</div>
      ),
    [noOptions, options, setValue, value]
  )

  const menuWrapperStyle = useMemo<React.CSSProperties>(
    () => ({ top: menuAbove ? menuHeight * -1 + 2 + 'px' : '100%' }),
    [menuAbove, menuHeight]
  )
  const menuStyle = useMemo<React.CSSProperties | undefined>(() => {
    const style: React.CSSProperties = {}
    // container menus are position: fixed — pin them to the control's viewport coords
    if (container && fixedPos) {
      style.top = fixedPos.top
      style.left = fixedPos.left
      style.width = fixedPos.width
    }
    if (gridColumns) style.gridTemplateColumns = `repeat(${gridColumns}, minmax(0, 1fr))`
    return Object.keys(style).length ? style : undefined
  }, [container, fixedPos, gridColumns])

  const dropdownLabel = useMemo(() => <p className="dropdown-label no-select">{label}</p>, [label])
  const numInputs = useMemo(
    () => (
      <div className="dropdown-num-inputs-wrapper">
        <div className="dropdown-num-inputs">
          <NumInput value={num1 as number} setValue={setNum1 as (value: number) => void} min={-12} max={12} />
          <NumInput value={num2 as number} setValue={setNum2 as (value: number) => void} min={-12} max={12} />
        </div>
      </div>
    ),
    [num1, num2, setNum1, setNum2]
  )

  return (
    <div
      ref={dropdownRef}
      className={classNames('dropdown-container', className, {
        'small-dropdown': small,
        'no-text-transform': noTextTransform,
        capitalize,
        'inline-dropdown': inline,
        'dropdown-num-inputs-container': setNum1,
        'show-dropdown-num-inputs': showNumInputs,
        'graphic-options': graphicOptions,
      })}
      style={minWidth ? { minWidth } : undefined}>
      <div className="dropdown">
        <div className={classNames('dropdown-root', { open })}>
          <div ref={controlRef} onClick={toggleOpen} className="dropdown-control">
            <div className={classNames('dropdown-placeholder', { selected: value })}>{displayValue || placeholder}</div>
            <div className="dropdown-arrow-wrapper">
              <span className="dropdown-arrow"></span>
            </div>
          </div>
          <div
            className={classNames('dropdown-menu-wrapper', { open, 'menu-above': menuAbove })}
            style={menuWrapperStyle}>
            <div
              ref={menuRef}
              className={classNames('dropdown-menu', { 'fixed-menu': container, 'grid-menu': gridColumns })}
              style={menuStyle}>
              {optionEls}
            </div>
          </div>
        </div>
        <div className="dropdown-min-width">{longestText(options, graphicOptions)}</div>
      </div>
      {label && dropdownLabel}
      {setNum1 && numInputs}
    </div>
  )
}
