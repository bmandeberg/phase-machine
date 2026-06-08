import React from 'react'
import EffectSlotControls from './EffectSlotControls'
import { SlotController } from './useEffectParams'
import { Setter, InstrumentParams } from '../../types'

interface EffectControlsProps {
  slots: [SlotController, SlotController, SlotController]
  theme: string
  grabbing?: boolean
  setGrabbing: Setter<boolean>
  tempo: number
  color: string
  savedInstrumentParams?: InstrumentParams
}

function EffectControls({ slots, theme, grabbing, setGrabbing, tempo, color, savedInstrumentParams }: EffectControlsProps) {
  return (
    <div className="controls-row">
      <div className="controls-module effects-controls">
        <p className="controls-label">Effects</p>
        <div className="effect-slots">
          {slots.map((controller, i) => (
            <EffectSlotControls
              key={i}
              controller={controller}
              savedSlot={savedInstrumentParams?.effects?.[i]}
              theme={theme}
              grabbing={grabbing}
              setGrabbing={setGrabbing}
              tempo={tempo}
              color={color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default React.memo(EffectControls)
