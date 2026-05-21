import React, { useCallback, useMemo } from 'react'
import { RATES, MOVEMENTS, MAX_SEQUENCE_LENGTH, MAX_SWING_LENGTH, SUSTAIN_MIN, themedSwitch } from '../globals'
import classNames from 'classnames'
import RotaryKnob from '../components/RotaryKnob'
import NumInput from '../components/NumInput'
import Dropdown from '../components/Dropdown'
import Key from '../components/Key'
import MuteSolo from '../components/MuteSolo'
import MIDI from '../components/MIDI'
import FlipOpposite from '../components/FlipOpposite'
import Piano from '../components/Piano'
import Instrument from '../components/Instrument'
import Fader from '../components/Fader'
import MidiInputMode from '../components/MidiInputMode'
import NotesMode from '../components/NotesMode'
import Switch from 'react-switch'

// ui elements

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function useUI(
  id: any,
  color: any,
  scribbler: any,
  setScribbler: any,
  channelNum: any,
  key: any,
  setKey: any,
  playingPitchClass: any,
  setPlayingPitchClass: any,
  turningAxisKnob: any,
  keyPreview: any,
  showKeyPreview: any,
  mute: any,
  muted: any,
  setMute: any,
  solo: any,
  setSolo: any,
  velocity: any,
  setVelocity: any,
  setGrabbing: any,
  grabbing: any,
  shiftAmt: any,
  updateShift: any,
  previewShift: any,
  setShowKeyPreview: any,
  setShiftDirectionForward: any,
  doShift: any,
  axis: any,
  updateAxis: any,
  startChangingAxis: any,
  stopChangingAxis: any,
  doFlip: any,
  previewFlip: any,
  doOpposite: any,
  previewOpposite: any,
  playingNote: any,
  noteOn: any,
  rangeStart: any,
  setRangeStart: any,
  rangeEnd: any,
  setRangeEnd: any,
  resizing: any,
  setResizing: any,
  setKeyRate: any,
  keyRate: any,
  setKeyMovement: any,
  keyMovement: any,
  keyArpInc1: any,
  setKeyArpInc1: any,
  keyArpInc2: any,
  setKeyArpInc2: any,
  sustain: any,
  setSustain: any,
  keySwing: any,
  setKeySwing: any,
  keySwingLength: any,
  setKeySwingLength: any,
  seqLength: any,
  setSeqLength: any,
  setSeqRate: any,
  seqRate: any,
  setSeqMovement: any,
  seqMovement: any,
  seqArpInc1: any,
  setSeqArpInc1: any,
  seqArpInc2: any,
  setSeqArpInc2: any,
  seqSwing: any,
  setSeqSwing: any,
  seqSwingLength: any,
  setSeqSwingLength: any,
  setHold: any,
  hold: any,
  instrumentOn: any,
  setInstrumentOn: any,
  instrumentType: any,
  setInstrumentType: any,
  keyViewType: any,
  setKeyViewType: any,
  duplicateChannel: any,
  deleteChannel: any,
  drag: any,
  draggingChannel: any,
  theme: any,
  seqRestart: any,
  seqOpposite: any,
  rangeMode: any,
  setRangeMode: any,
  keybdPitches: any,
  setKeybdPitches: any,
  midiIn: any,
  setMidiIn: any,
  midiHold: any,
  setMidiHold: any,
  keyClear: any,
  keyRestart: any,
  openMidiModal: any,
  openInstrumentModal: any,
  updateOnce: any,
  triggerNote: any
) {
  const updateScribbler = useCallback(
    (e: any) => {
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
          <div className="channel-number-background"></div>
          <div
            className={classNames('channel-number', { auxiliary })}
            style={{
              color,
              cursor: draggingChannel ? 'grabbing' : 'grab',
            }}
            {...drag()}
            draggable="false">
            {channelNum + 1}
          </div>
        </div>
      )
    },
    [channelNum, color, drag, draggingChannel]
  )

  const channelNumNormal = useMemo(() => channelNumEl(false), [channelNumEl])
  const channelNumAux = useMemo(() => channelNumEl(true), [channelNumEl])

  const duplicateDeleteEl = useMemo(() => {
    return (
      <div className="duplicate-delete">
        <div
          className={classNames('duplicate', { mute })}
          onClick={() => duplicateChannel(id)}
          title="Duplicate channel"></div>
        <div className={classNames('delete', { mute })} onClick={() => deleteChannel(id)} title="Delete channel"></div>
      </div>
    )
  }, [deleteChannel, duplicateChannel, id, mute])

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

  const midiEl = useMemo(
    () => <MIDI midiIn={midiIn} setMidiIn={setMidiIn} openMidiModal={openMidiModal} />,
    [midiIn, openMidiModal, setMidiIn]
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
  const onHandleColor = useMemo(() => themedSwitch('onHandleColor', theme), [theme])

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
    () => <MidiInputMode midiHold={midiHold} setMidiHold={setMidiHold} theme={theme} />,
    [midiHold, setMidiHold, theme]
  )

  const notesModeEl = useMemo(() => {
    return <NotesMode rangeMode={rangeMode} setRangeMode={setRangeMode} theme={theme} />
  }, [rangeMode, setRangeMode, theme])

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
        options={RATES}
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
        />
      )
    },
    [sustain, setSustain, setGrabbing, grabbing, muted, theme, updateOnce]
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

  const seqRateEl = useCallback(
    (inline: boolean) => {
      return (
        <Dropdown
          className="channel-module"
          label="Rate"
          options={RATES}
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
        />
      )
    },
    [instrumentOn, instrumentType, mute, openInstrumentModal, setInstrumentOn, setInstrumentType, theme]
  )

  const instrumentNormal = useMemo(() => instrumentEl(false), [instrumentEl])
  const instrumentSmall = useMemo(() => instrumentEl(true), [instrumentEl])

  return {
    channelNumNormal,
    channelNumAux,
    duplicateDeleteEl,
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
    midiEl,
    clearResetEl,
    midiInputModeEl,
    scribblerEl,
  }
}
