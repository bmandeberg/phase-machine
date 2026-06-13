import React, { useCallback, useMemo, ChangeEvent } from 'react'
import { ReactDOMAttributes } from '@use-gesture/react/dist/declarations/src/types'
import { Setter, Channel as ChannelType } from '../types'
import { RATE_DROPDOWN_OPTIONS, MOVEMENTS, MAX_SEQUENCE_LENGTH, MAX_SWING_LENGTH, SUSTAIN_MIN, themedSwitch } from '../globals'
import classNames from 'classnames'
import RotaryKnob from '../components/RotaryKnob'
import NumInput from '../components/NumInput'
import Dropdown from '../components/Dropdown'
import Key from '../components/Key'
import MuteSolo from '../components/MuteSolo'
import ChannelButtons from '../components/ChannelButtons'
import FlipOpposite from '../components/FlipOpposite'
import Piano from '../components/Piano'
import Instrument from '../components/Instrument'
import Fader from '../components/Fader'
import MidiInputMode from '../components/MidiInputMode'
import NotesMode from '../components/NotesMode'
import Switch from 'react-switch'

// ui elements

export default function useUI(
  id: string,
  color: string,
  scribbler: string,
  setScribbler: Setter<string>,
  channelNum: number,
  key: boolean[],
  setKey: Setter<boolean[]>,
  playingPitchClass: number | null,
  setPlayingPitchClass: Setter<number | null>,
  turningAxisKnob: boolean,
  keyPreview: boolean[],
  showKeyPreview: boolean,
  mute: boolean,
  muted: boolean,
  setMute: Setter<boolean>,
  solo: boolean,
  setSolo: Setter<boolean>,
  velocity: number,
  setVelocity: Setter<number>,
  setGrabbing: Setter<boolean>,
  grabbing: boolean,
  shiftAmt: number,
  updateShift: (newShift: number) => void,
  previewShift: (forward?: boolean, newShift?: number, previewKey?: boolean[]) => void,
  setShowKeyPreview: Setter<boolean>,
  setShiftDirectionForward: Setter<boolean>,
  doShift: () => void,
  axis: number,
  updateAxis: (a: number) => void,
  startChangingAxis: () => void,
  stopChangingAxis: () => void,
  doFlip: () => void,
  previewFlip: () => void,
  doOpposite: () => void,
  previewOpposite: () => void,
  playingNote: number | undefined,
  noteOn: boolean,
  rangeStart: number,
  setRangeStart: Setter<number>,
  rangeEnd: number,
  setRangeEnd: Setter<number>,
  resizing: boolean,
  setResizing: Setter<boolean>,
  setKeyRate: Setter<string>,
  keyRate: string,
  setKeyMovement: Setter<string>,
  keyMovement: string,
  keyArpInc1: number,
  setKeyArpInc1: Setter<number>,
  keyArpInc2: number,
  setKeyArpInc2: Setter<number>,
  sustain: number,
  setSustain: Setter<number>,
  keySwing: number,
  setKeySwing: Setter<number>,
  keySwingLength: number,
  setKeySwingLength: Setter<number>,
  seqLength: number,
  setSeqLength: Setter<number>,
  setSeqRate: Setter<string>,
  seqRate: string,
  setSeqMovement: Setter<string>,
  seqMovement: string,
  seqArpInc1: number,
  setSeqArpInc1: Setter<number>,
  seqArpInc2: number,
  setSeqArpInc2: Setter<number>,
  seqSwing: number,
  setSeqSwing: Setter<number>,
  seqSwingLength: number,
  setSeqSwingLength: Setter<number>,
  seqShiftAmt: number,
  updateSeqShift: (n: number) => void,
  previewSeqShift: (forward?: boolean, newShift?: number, previewSteps?: boolean[]) => void,
  setShowSeqPreview: Setter<boolean>,
  setSeqShiftDirectionForward: Setter<boolean>,
  doSeqShift: () => void,
  setHold: Setter<boolean>,
  hold: boolean,
  instrumentOn: boolean,
  setInstrumentOn: Setter<boolean>,
  instrumentType: string,
  setInstrumentType: Setter<string>,
  keyViewType: number,
  setKeyViewType: Setter<number>,
  duplicateChannel: (id: string) => void,
  deleteChannel: (id: string) => void,
  drag: (...args: unknown[]) => ReactDOMAttributes,
  draggingChannel: boolean,
  theme: string,
  seqRestart: () => void,
  seqOpposite: () => void,
  rangeMode: boolean,
  setRangeMode: Setter<boolean>,
  keybdPitches: number[],
  setKeybdPitches: Setter<number[]>,
  midiHold: boolean,
  setMidiHold: Setter<boolean>,
  keyClear: () => void,
  keyRestart: () => void,
  openMidiModal: () => void,
  openInstrumentModal: () => void,
  updateOnce: boolean,
  triggerNote: (i: number, callback: () => void) => void,
  // the saved version of this channel in the current preset — supplies each knob's
  // double-click reset target.
  channelPreset?: ChannelType,
  // setter for editing this channel's color by clicking its number (opens the hidden
  // native <input type="color"> rendered in the channel-number container).
  setChannelColor?: (id: string, color: string) => void
) {
  const updateScribbler = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setScribbler(e.target.value)
    },
    [setScribbler]
  )
  const scribblerEl = useMemo(() => {
    const maxLength = 6
    const fontSize = 16
    return (
      <div className="scribbler">
        <div className="scribbler-input-container">
          <textarea
            className="scribbler-input nowrap"
            value={scribbler}
            onChange={updateScribbler}
            style={{
              fontSize:
                !scribbler || scribbler.length < maxLength ? fontSize : fontSize - (scribbler.length - maxLength),
            }}
          />
        </div>
      </div>
    )
  }, [scribbler, updateScribbler])

  const channelNumEl = useCallback(
    (auxiliary: boolean) => {
      return (
        <div className="channel-number-container">
          {/* Native color picker for this channel, sized/placed over the number but BEHIND
              it (the number div, later in DOM, sits on top and owns the click+drag). Kept
              pointer-events:auto so Chrome anchors its popup to the input (a
              pointer-events:none input makes Chrome drop the popup to a fallback position).
              Opened by the number's onClick, which finds THIS container's input — the
              number renders for both the main and aux rows, so a shared ref would point at
              only one of them and pop the picker at the wrong number. */}
          <input
            type="color"
            className="channel-color-input"
            value={color}
            onChange={(e) => setChannelColor?.(id, e.target.value)}
            tabIndex={-1}
            aria-hidden="true"
          />
          <div
            className={classNames('channel-number', { auxiliary })}
            style={{
              color,
              cursor: draggingChannel ? 'grabbing' : 'grab',
            }}
            // a plain click (not a drag) opens this number's own color picker
            onClick={(e) =>
              (e.currentTarget.parentElement?.querySelector('.channel-color-input') as HTMLInputElement | null)?.click()
            }
            {...drag()}
            draggable="false">
            {channelNum + 1}
          </div>
          {/* Compact mute/solo beneath the channel number — only on the stacked
              auxiliary (sequencer) row, which has no full Mute/Solo of its own. The
              main row's full Mute/Solo lives in the sticky header (see the views),
              so it no longer needs this scroll-in variant. */}
          {auxiliary && (
            <div className="channel-mute-solo">
              <div
                className={classNames('channel-mute-solo-button', { muted: mute })}
                onClick={() => setMute((m) => !m)}
                title="Mute channel">
                M
              </div>
              <div
                className={classNames('channel-mute-solo-button solo', { soloed: solo })}
                onClick={() => setSolo((s) => !s)}
                title="Solo channel">
                S
              </div>
            </div>
          )}
        </div>
      )
    },
    [channelNum, color, drag, draggingChannel, mute, solo, setMute, setSolo, setChannelColor, id]
  )

  const channelNumNormal = useMemo(() => channelNumEl(false), [channelNumEl])
  const channelNumAux = useMemo(() => channelNumEl(true), [channelNumEl])

  const channelButtonsEl = useMemo(
    () => (
      <ChannelButtons
        id={id}
        instrumentType={instrumentType}
        theme={theme}
        mute={mute}
        openInstrumentModal={openInstrumentModal}
        openMidiModal={openMidiModal}
        duplicateChannel={duplicateChannel}
        deleteChannel={deleteChannel}
      />
    ),
    [deleteChannel, duplicateChannel, id, instrumentType, mute, openInstrumentModal, openMidiModal, theme]
  )

  const keyEl = useMemo(() => {
    return (
      <Key
        className="channel-module"
        musicalKey={key}
        setKey={setKey}
        playingPitchClass={playingPitchClass}
        setPlayingPitchClass={setPlayingPitchClass}
        pianoKeys
        turningAxisKnob={turningAxisKnob}
        keyPreview={keyPreview}
        showKeyPreview={showKeyPreview}
        mute={muted}
        rangeMode={rangeMode}
      />
    )
  }, [
    key,
    keyPreview,
    muted,
    playingPitchClass,
    rangeMode,
    setKey,
    setPlayingPitchClass,
    showKeyPreview,
    turningAxisKnob,
  ])

  const muteSoloEl = useMemo(
    () => <MuteSolo mute={mute} setMute={setMute} solo={solo} setSolo={setSolo} />,
    [mute, setMute, setSolo, solo]
  )

  const velocityEl = useMemo(() => {
    return (
      <Fader
        className="channel-module velocity"
        value={velocity}
        setValue={setVelocity}
        label="Vel"
        setGrabbing={setGrabbing}
        grabbing={grabbing}
        mute={muted}
        theme={theme}
      />
    )
  }, [grabbing, muted, setGrabbing, setVelocity, theme, velocity])

  const shiftEl = useMemo(() => {
    return (
      <NumInput
        className="channel-module shift-input"
        value={shiftAmt}
        setValue={updateShift}
        label="Shift"
        preview={previewShift}
        setShowKeyPreview={setShowKeyPreview}
        setDirectionForward={setShiftDirectionForward}
        buttonText="Shift"
        buttonAction={doShift}
      />
    )
  }, [doShift, previewShift, setShiftDirectionForward, setShowKeyPreview, shiftAmt, updateShift])

  const axisEl = useCallback(
    (clock: boolean) => {
      const className = classNames({ 'channel-module': !clock, 'axis-knob': clock })
      return (
        <RotaryKnob
          className={className}
          value={axis}
          setValue={updateAxis}
          grabbing={grabbing}
          axisKnob
          axisKnobLarge={clock}
          musicalKey={key}
          setKey={setKey}
          playingPitchClass={playingPitchClass}
          setPlayingPitchClass={setPlayingPitchClass}
          turningAxisKnob={turningAxisKnob}
          keyPreview={keyPreview}
          showKeyPreview={showKeyPreview}
          startChangingAxis={startChangingAxis}
          stopChangingAxis={stopChangingAxis}
          mute={muted}
          theme={theme}
          rangeMode={rangeMode}
          updateOnce={updateOnce}
        />
      )
    },
    [
      axis,
      grabbing,
      key,
      keyPreview,
      muted,
      playingPitchClass,
      rangeMode,
      setKey,
      setPlayingPitchClass,
      showKeyPreview,
      startChangingAxis,
      stopChangingAxis,
      theme,
      turningAxisKnob,
      updateAxis,
      updateOnce,
    ]
  )

  const axisNormal = useMemo(() => axisEl(false), [axisEl])
  const axisClock = useMemo(() => axisEl(true), [axisEl])

  const flipOppositeEl = useMemo(() => {
    return (
      <FlipOpposite
        flip={doFlip}
        previewFlip={previewFlip}
        opposite={doOpposite}
        previewOpposite={previewOpposite}
        setShowKeyPreview={setShowKeyPreview}
      />
    )
  }, [doFlip, doOpposite, previewFlip, previewOpposite, setShowKeyPreview])

  const offColor = useMemo(() => themedSwitch('offColor', theme), [theme])
  const onColor = useMemo(() => themedSwitch('onColor', theme), [theme])
  const offHandleColor = useMemo(() => themedSwitch('offHandleColor', theme, mute), [mute, theme])
  // per-channel switch "on" handles use the channel color (on = channel color)
  const onHandleColor = color

  const clearResetEl = useMemo(
    () => (
      <div className="clear-reset channel-module stacked-buttons">
        <div onClick={keyClear} className="button">
          Clear
        </div>
        <div onClick={keyRestart} className="button">
          Restart
        </div>
      </div>
    ),
    [keyClear, keyRestart]
  )

  const midiInputModeEl = useMemo(
    () => <MidiInputMode midiHold={midiHold} setMidiHold={setMidiHold} theme={theme} color={color} />,
    [midiHold, setMidiHold, theme, color]
  )

  const notesModeEl = useMemo(() => {
    return <NotesMode rangeMode={rangeMode} setRangeMode={setRangeMode} theme={theme} color={color} />
  }, [rangeMode, setRangeMode, theme, color])

  const pianoEl = useMemo(() => {
    return (
      <Piano
        playingNote={playingNote}
        noteOn={noteOn}
        rangeStart={rangeStart}
        setRangeStart={setRangeStart}
        rangeEnd={rangeEnd}
        setRangeEnd={setRangeEnd}
        channelNum={channelNum}
        grabbing={grabbing}
        setGrabbing={setGrabbing}
        resizing={resizing}
        setResizing={setResizing}
        mute={muted}
        rangeMode={rangeMode}
        keybdPitches={keybdPitches}
        setKeybdPitches={setKeybdPitches}
        theme={theme}
        triggerNote={triggerNote}
      />
    )
  }, [
    channelNum,
    grabbing,
    keybdPitches,
    muted,
    noteOn,
    playingNote,
    rangeEnd,
    rangeMode,
    rangeStart,
    resizing,
    setGrabbing,
    setKeybdPitches,
    setRangeEnd,
    setRangeStart,
    setResizing,
    theme,
    triggerNote,
  ])

  const keyViewTypeEl = useMemo(() => {
    return (
      <NumInput
        className="channel-module key-view-type"
        value={keyViewType}
        setValue={setKeyViewType}
        label="Interval"
        min={1}
        max={11}
        short={true}
        disabled
      />
    )
  }, [keyViewType, setKeyViewType])

  const keyRateEl = useMemo(
    () => (
      <Dropdown
        className="channel-module key-rate"
        label="Rate"
        options={RATE_DROPDOWN_OPTIONS}
        gridColumns={3}
        setValue={setKeyRate}
        value={keyRate}
        noTextTransform
      />
    ),
    [keyRate, setKeyRate]
  )

  const movements = useMemo(() => Object.keys(MOVEMENTS), [])

  const keyMovementEl = useMemo(() => {
    return (
      <Dropdown
        className="channel-module key-movement"
        label="Movement"
        options={movements}
        setValue={setKeyMovement}
        value={keyMovement}
        showNumInputs={keyMovement === '+/-'}
        num1={keyArpInc1}
        setNum1={setKeyArpInc1}
        num2={keyArpInc2}
        setNum2={setKeyArpInc2}
      />
    )
  }, [movements, keyArpInc1, keyArpInc2, keyMovement, setKeyArpInc1, setKeyArpInc2, setKeyMovement])

  const sustainEl = useCallback(
    (vertical: boolean) => {
      return (
        <RotaryKnob
          min={SUSTAIN_MIN}
          className="channel-module key-sustain"
          value={sustain}
          setValue={setSustain}
          label="Sustain"
          setGrabbing={setGrabbing}
          grabbing={grabbing}
          squeeze={!vertical ? 6 : 0}
          mute={muted}
          theme={theme}
          updateOnce={updateOnce}
          resetValue={channelPreset?.sustain}
        />
      )
    },
    [sustain, setSustain, setGrabbing, grabbing, muted, theme, updateOnce, channelPreset?.sustain]
  )

  const sustainNormal = useMemo(() => sustainEl(false), [sustainEl])
  const sustainVertical = useMemo(() => sustainEl(true), [sustainEl])

  const keySwingEl = useCallback(
    (vertical: boolean) => {
      return (
        <div className="swing-module channel-module">
          <RotaryKnob
            className="key-swing"
            value={keySwing}
            setValue={setKeySwing}
            label="Swing"
            setGrabbing={setGrabbing}
            grabbing={grabbing}
            squeeze={!vertical ? 2 : 0}
            detent
            mute={mute}
            theme={theme}
            updateOnce={updateOnce}
            resetValue={channelPreset?.keySwing}
          />
          <NumInput
            value={keySwingLength}
            setValue={setKeySwingLength}
            label="Length"
            min={2}
            max={MAX_SWING_LENGTH}
            short={true}
          />
        </div>
      )
    },
    [
      grabbing,
      keySwing,
      keySwingLength,
      mute,
      setGrabbing,
      setKeySwing,
      setKeySwingLength,
      theme,
      updateOnce,
      channelPreset?.keySwing,
    ]
  )

  const keySwingNormal = useMemo(() => keySwingEl(false), [keySwingEl])
  const keySwingVertical = useMemo(() => keySwingEl(true), [keySwingEl])

  const seqLengthEl = useCallback(
    (inline: boolean) => {
      return (
        <NumInput
          className="channel-module"
          value={seqLength}
          setValue={setSeqLength}
          label="Steps"
          min={1}
          max={MAX_SEQUENCE_LENGTH}
          inline={inline}
          short={!inline}
        />
      )
    },
    [seqLength, setSeqLength]
  )

  const seqLengthNormal = useMemo(() => seqLengthEl(false), [seqLengthEl])
  const seqLengthInline = useMemo(() => seqLengthEl(true), [seqLengthEl])

  const seqShiftEl = useCallback(
    (inline: boolean) => {
      return (
        <NumInput
          className="channel-module"
          value={seqShiftAmt}
          setValue={updateSeqShift}
          label="Shift"
          min={-(seqLength - 1)}
          max={seqLength - 1}
          preview={previewSeqShift}
          setShowKeyPreview={setShowSeqPreview}
          setDirectionForward={setSeqShiftDirectionForward}
          buttonText="Shift"
          buttonAction={doSeqShift}
          inline={inline}
          short={!inline}
        />
      )
    },
    [seqShiftAmt, updateSeqShift, seqLength, previewSeqShift, setShowSeqPreview, setSeqShiftDirectionForward, doSeqShift]
  )

  const seqShiftNormal = useMemo(() => seqShiftEl(false), [seqShiftEl])
  const seqShiftInline = useMemo(() => seqShiftEl(true), [seqShiftEl])

  const seqRateEl = useCallback(
    (inline: boolean) => {
      return (
        <Dropdown
          className="channel-module"
          label="Rate"
          options={RATE_DROPDOWN_OPTIONS}
          gridColumns={3}
          setValue={setSeqRate}
          value={seqRate}
          noTextTransform
          inline={inline}
        />
      )
    },
    [seqRate, setSeqRate]
  )

  const seqRateNormal = useMemo(() => seqRateEl(false), [seqRateEl])
  const seqRateInline = useMemo(() => seqRateEl(true), [seqRateEl])

  const seqMovementEl = useCallback(
    (inline: boolean) => {
      return (
        <Dropdown
          className="channel-module seq-movement"
          label="Movement"
          options={movements}
          setValue={setSeqMovement}
          value={seqMovement}
          inline={inline}
          showNumInputs={seqMovement === '+/-'}
          num1={seqArpInc1}
          setNum1={setSeqArpInc1}
          num2={seqArpInc2}
          setNum2={setSeqArpInc2}
        />
      )
    },
    [movements, seqArpInc1, seqArpInc2, seqMovement, setSeqArpInc1, setSeqArpInc2, setSeqMovement]
  )

  const seqMovementNormal = useMemo(() => seqMovementEl(false), [seqMovementEl])
  const seqMovementInline = useMemo(() => seqMovementEl(true), [seqMovementEl])

  const seqSwingEl = useCallback(
    (inline: boolean) => {
      return (
        <div className="swing-module channel-module">
          <RotaryKnob
            className="channel-module"
            value={seqSwing}
            setValue={setSeqSwing}
            label="Swing"
            setGrabbing={setGrabbing}
            grabbing={grabbing}
            inline={inline}
            detent
            mute={mute}
            theme={theme}
            updateOnce={updateOnce}
            resetValue={channelPreset?.seqSwing}
          />
          <NumInput
            value={seqSwingLength}
            setValue={setSeqSwingLength}
            label="Length"
            min={2}
            max={MAX_SWING_LENGTH}
            short={true}
            inline={inline}
          />
        </div>
      )
    },
    [
      grabbing,
      mute,
      seqSwing,
      seqSwingLength,
      setGrabbing,
      setSeqSwing,
      setSeqSwingLength,
      theme,
      updateOnce,
      channelPreset?.seqSwing,
    ]
  )

  const seqSwingNormal = useMemo(() => seqSwingEl(false), [seqSwingEl])
  const seqSwingInline = useMemo(() => seqSwingEl(true), [seqSwingEl])

  const holdEl = useCallback(
    (inline: boolean) => {
      return (
        <div className={classNames('switch-container channel-module', { inline })}>
          <Switch
            className="switch"
            onChange={setHold}
            checked={hold}
            uncheckedIcon={false}
            checkedIcon={false}
            offColor={offColor}
            onColor={onColor}
            offHandleColor={offHandleColor}
            onHandleColor={onHandleColor}
            width={48}
            height={24}
          />
          <p className="switch-label">Hold</p>
        </div>
      )
    },
    [hold, offColor, offHandleColor, onColor, onHandleColor, setHold]
  )

  const holdNormal = useMemo(() => holdEl(false), [holdEl])
  const holdInline = useMemo(() => holdEl(true), [holdEl])

  const seqRestartEl = useMemo(() => {
    return (
      <div className="button seq-button channel-module" onClick={seqRestart}>
        Restart
      </div>
    )
  }, [seqRestart])

  const seqOppositeEl = useMemo(() => {
    return (
      <div className="button seq-button channel-module" onClick={seqOpposite}>
        Opposite
      </div>
    )
  }, [seqOpposite])

  const seqOppositeRestartEl = useMemo(() => {
    return (
      <div className="restart-opposite stacked-buttons">
        <div className="button seq-button" onClick={seqRestart}>
          Restart
        </div>
        <div className="button seq-button" onClick={seqOpposite}>
          Opposite
        </div>
      </div>
    )
  }, [seqOpposite, seqRestart])

  const instrumentEl = useCallback(
    (small: boolean) => {
      return (
        <Instrument
          className="channel-module"
          instrumentOn={instrumentOn}
          setInstrumentOn={setInstrumentOn}
          instrumentType={instrumentType}
          setInstrumentType={setInstrumentType}
          small={small}
          theme={theme}
          mute={mute}
          openInstrumentModal={openInstrumentModal}
          inModal={false}
          color={color}
        />
      )
    },
    [color, instrumentOn, instrumentType, mute, openInstrumentModal, setInstrumentOn, setInstrumentType, theme]
  )

  const instrumentNormal = useMemo(() => instrumentEl(false), [instrumentEl])
  const instrumentSmall = useMemo(() => instrumentEl(true), [instrumentEl])

  return {
    channelNumNormal,
    channelNumAux,
    channelButtonsEl,
    keyEl,
    muteSoloEl,
    velocityEl,
    shiftEl,
    axisNormal,
    axisClock,
    flipOppositeEl,
    pianoEl,
    keyRateEl,
    keyMovementEl,
    sustainNormal,
    sustainVertical,
    keySwingNormal,
    keySwingVertical,
    seqLengthNormal,
    seqLengthInline,
    seqShiftNormal,
    seqShiftInline,
    seqRateNormal,
    seqRateInline,
    seqMovementNormal,
    seqMovementInline,
    seqSwingNormal,
    seqSwingInline,
    holdNormal,
    holdInline,
    instrumentNormal,
    instrumentSmall,
    keyViewTypeEl,
    seqRestartEl,
    seqOppositeEl,
    seqOppositeRestartEl,
    notesModeEl,
    clearResetEl,
    midiInputModeEl,
    scribblerEl,
  }
}

// The bag of memoized UI elements useUI returns — consumed by the Channel view
// components (StackedView / HorizontalView / ClockView) via a {...ui} spread.
export type UIElements = ReturnType<typeof useUI>
