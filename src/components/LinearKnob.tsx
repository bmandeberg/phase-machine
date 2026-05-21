import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useGesture } from '@use-gesture/react'
import parse from 'html-react-parser'
import { constrain } from '../math'

interface KnobSkin {
  svg: string
  knobX: number
  knobY: number
}

interface LinearKnobProps {
  className?: string
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  skin: KnobSkin
  style?: React.CSSProperties
  onStart: () => void
  onEnd: () => void
  clampMax: number
  rotateDegrees: number
  unlockDistance?: number
}

export default function LinearKnob({
  className,
  min,
  max,
  value,
  onChange,
  skin,
  style,
  onStart,
  onEnd,
  clampMax,
  rotateDegrees,
}: LinearKnobProps) {
  const [svg, setSVG] = useState<HTMLDivElement>()

  useEffect(() => {
    const container = document.createElement('div')
    container.innerHTML = skin.svg
    setSVG(container)
  }, [skin])

  const valueRef = useRef(0)
  const drag = useGesture({
    onDrag: ({ movement: [dx, dy] }) => {
      const range = max - min
      const dragScalar = 150
      const xOffset = ((dx / dragScalar) * range) / 2
      const yOffset = ((-dy / dragScalar) * range) / 2
      let newValue = valueRef.current + xOffset + yOffset
      if (clampMax === 360) {
        newValue %= max
        if (newValue < 0) {
          newValue = max + newValue
        }
      } else {
        newValue = constrain(newValue, min, max)
      }
      onChange(newValue)
    },
    onDragStart: () => {
      valueRef.current = value
      onStart()
    },
    onDragEnd: onEnd,
  })

  const knobStyle = useMemo<React.CSSProperties>(() => {
    return Object.assign({ width: 50, height: 50, position: 'relative', overflow: 'hidden' }, style)
  }, [style])

  const knobHTML = useMemo(() => {
    if (svg) {
      const rotation = rotateDegrees + ((value - min) / (max - min)) * clampMax
      svg.querySelector('#knob')?.setAttribute('transform', `rotate(${rotation}, ${skin.knobX}, ${skin.knobY})`)
      return parse(svg.innerHTML)
    }
    return null
  }, [svg, rotateDegrees, value, min, max, clampMax, skin])

  return (
    <div className={className} style={knobStyle} draggable="false" {...drag()}>
      {knobHTML}
    </div>
  )
}
