import React, { useMemo, useCallback } from 'react'
import RotaryKnob from '../RotaryKnob'
import Dropdown from '../Dropdown'
import Switch from 'react-switch'
import { EFFECTS, themedSwitch, RATES } from '../../globals'
import { rateToSeconds } from '../../math'
import useEffectParams from './useEffectParams'
import { EffectRefs, Setter } from '../../types'

type EffectControlsProps = ReturnType<typeof useEffectParams> & {
  effects: EffectRefs
  theme: string
  grabbing?: boolean
  setGrabbing: Setter<boolean>
  tempo: number
  color: string
}

function EffectControls({
  effectType,
  setEffectType,
  effectWet,
  setEffectWet,
  chorusDepth,
  setChorusDepth,
  chorusDelayTime,
  setChorusDelayTime,
  chorusFreq,
  setChorusFreq,
  chorusSpread,
  setChorusSpread,
  distortion,
  setDistortion,
  syncDelayTime,
  setSyncDelayTime,
  delayTime,
  setDelayTime,
  delayFeedback,
  setDelayFeedback,
  reverbDecay,
  setReverbDecay,
  reverbPreDelay,
  setReverbPreDelay,
  vibratoDepth,
  setVibratoDepth,
  vibratoFreq,
  setVibratoFreq,
  effects,
  theme,
  grabbing,
  setGrabbing,
  tempo,
  color,
}: EffectControlsProps) {
  const offColor = useMemo(() => themedSwitch('offColor', theme), [theme])
  const onColor = useMemo(() => themedSwitch('onColor', theme), [theme])
  const offHandleColor = useMemo(() => themedSwitch('offHandleColor', theme, false), [theme])
  // effect-enable handles use the channel color when on (on = channel color)
  const onHandleColor = color

  // The synced rate (e.g. '8n') is stored in syncDelayTime; useEffectParams derives
  // the actual delayTime seconds from it + the current tempo, so it tracks BPM.
  const syncedDelayOptions = useMemo(() => RATES.filter((rate) => rateToSeconds(rate, tempo) <= 1), [tempo])
  const syncedDelay = useMemo(() => (typeof syncDelayTime === 'string' ? syncDelayTime : null), [syncDelayTime])
  const setSyncedDelay = useCallback((rate: string) => setSyncDelayTime(rate), [setSyncDelayTime])
  const toggleSyncDelay = useCallback(
    (on: boolean) => {
      if (!on) {
        setSyncDelayTime(false)
        return
      }
      // Enabling sync: snap the current free delay time to the nearest musical rate.
      let nearest = syncedDelayOptions[0]
      let bestDiff = Infinity
      for (const rate of syncedDelayOptions) {
        const diff = Math.abs(rateToSeconds(rate, tempo) - delayTime)
        if (diff < bestDiff) {
          bestDiff = diff
          nearest = rate
        }
      }
      setSyncDelayTime(nearest)
    },
    [setSyncDelayTime, syncedDelayOptions, tempo, delayTime]
  )

  return (
    <div className="controls-row">
      <div className="controls-module effects-controls">
        <p className="controls-label">Effects</p>
        <Dropdown
          className="instrument-item"
          label="Effect"
          options={EFFECTS}
          setValue={setEffectType}
          value={effectType}
          container=".modal-content"
        />
        {effectType !== 'none' && effects[(effectType + 'Effect') as keyof EffectRefs].current && (
          <RotaryKnob
            className="instrument-item"
            min={0}
            max={1}
            value={effectWet}
            setValue={setEffectWet}
            label="Amount"
            setGrabbing={setGrabbing}
            grabbing={grabbing}
            inline={false}
            mute={false}
            theme={theme}
          />
        )}
        {effectType === 'chorus' &&
          (effects.chorusEffect.current ? (
            <div className="controls-aux">
              <RotaryKnob
                className="instrument-item"
                min={0}
                max={1}
                value={chorusDepth}
                setValue={setChorusDepth}
                label="Depth"
                setGrabbing={setGrabbing}
                grabbing={grabbing}
                inline={false}
                mute={false}
                theme={theme}
                logarithmic
              />
              <RotaryKnob
                className="instrument-item"
                min={0.1}
                max={10}
                value={chorusDelayTime}
                setValue={setChorusDelayTime}
                label="Delay"
                setGrabbing={setGrabbing}
                grabbing={grabbing}
                inline={false}
                mute={false}
                theme={theme}
              />
              <RotaryKnob
                className="instrument-item"
                min={1}
                max={20}
                value={chorusFreq}
                setValue={setChorusFreq}
                label="Freq"
                setGrabbing={setGrabbing}
                grabbing={grabbing}
                inline={false}
                mute={false}
                theme={theme}
                logarithmic
              />
              <RotaryKnob
                className="instrument-item"
                min={0}
                max={180}
                value={chorusSpread}
                setValue={setChorusSpread}
                label="Stereo"
                setGrabbing={setGrabbing}
                grabbing={grabbing}
                inline={false}
                mute={false}
                theme={theme}
              />
            </div>
          ) : (
            <div className="controls-aux">
              <p className="effect-disabled">Chorus doesn't work in Safari 😢</p>
            </div>
          ))}
        {effectType === 'distortion' && (
          <div className="controls-aux">
            <RotaryKnob
              className="instrument-item"
              min={0}
              max={3}
              value={distortion}
              setValue={setDistortion}
              label="Distortion"
              setGrabbing={setGrabbing}
              grabbing={grabbing}
              inline={false}
              mute={false}
              theme={theme}
            />
          </div>
        )}
        {effectType === 'delay' && (
          <div className="controls-aux">
            <div className="switch-container instrument-item">
              <Switch
                className="switch"
                onChange={toggleSyncDelay}
                checked={!!syncDelayTime}
                uncheckedIcon={false}
                checkedIcon={false}
                offColor={offColor}
                onColor={onColor}
                offHandleColor={offHandleColor}
                onHandleColor={onHandleColor}
                width={48}
                height={24}
              />
              <p className="switch-label">Sync</p>
            </div>
            {!syncDelayTime && (
              <RotaryKnob
                className="instrument-item"
                min={0}
                max={1}
                value={delayTime}
                setValue={setDelayTime}
                label="Time"
                setGrabbing={setGrabbing}
                grabbing={grabbing}
                inline={false}
                mute={false}
                theme={theme}
              />
            )}
            {syncDelayTime && (
              <Dropdown
                className="instrument-item"
                label="Time"
                options={syncedDelayOptions}
                setValue={setSyncedDelay}
                value={syncedDelay}
                placeholder="Select Rate"
                noTextTransform
                container=".modal-content"
              />
            )}
            <RotaryKnob
              className="instrument-item"
              min={0}
              max={1}
              value={delayFeedback}
              setValue={setDelayFeedback}
              label="Feedback"
              setGrabbing={setGrabbing}
              grabbing={grabbing}
              inline={false}
              mute={false}
              theme={theme}
            />
          </div>
        )}
        {effectType === 'reverb' && (
          <div className="controls-aux">
            <RotaryKnob
              className="instrument-item"
              min={0}
              max={4}
              value={reverbDecay}
              setValue={setReverbDecay}
              label="Decay"
              setGrabbing={setGrabbing}
              grabbing={grabbing}
              inline={false}
              mute={false}
              theme={theme}
            />
            <RotaryKnob
              className="instrument-item"
              min={0}
              max={0.5}
              value={reverbPreDelay}
              setValue={setReverbPreDelay}
              label="Pre Delay"
              setGrabbing={setGrabbing}
              grabbing={grabbing}
              inline={false}
              mute={false}
              theme={theme}
            />
          </div>
        )}
        {effectType === 'vibrato' && (
          <div className="controls-aux">
            <RotaryKnob
              className="instrument-item"
              min={0}
              max={1}
              value={vibratoDepth}
              setValue={setVibratoDepth}
              label="Depth"
              setGrabbing={setGrabbing}
              grabbing={grabbing}
              inline={false}
              mute={false}
              theme={theme}
            />
            <RotaryKnob
              className="instrument-item"
              min={1}
              max={20}
              value={vibratoFreq}
              setValue={setVibratoFreq}
              label="Freq"
              setGrabbing={setGrabbing}
              grabbing={grabbing}
              inline={false}
              mute={false}
              theme={theme}
              logarithmic
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(EffectControls)
