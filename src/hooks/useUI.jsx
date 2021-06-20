import React, { useCallback, useMemo } from 'react'
import { RATES, ARP_MODES, MAX_SEQUENCE_LENGTH, MAX_SWING_LENGTH, SUSTAIN_MIN, themedSwitch } from '../globals'
import classNames from 'classnames'
import RotaryKnob from '../components/RotaryKnob'
import NumInput from '../components/NumInput'
import Dropdn from '../components/Dropdn'
import Key from '../components/Key'
import MuteSolo from '../components/MuteSolo'
import FlipOpposite from '../components/FlipOpposite'
import Piano from '../components/Piano'
import Instrument from '../components/Instrument'
import Fader from '../components/Fader'
import Switch from 'react-switch'

// ui elements

export default function useUI(
  id,
  color,
  channelNum,
  key,
  setKey,
  playingPitchClass,
  setPlayingPitchClass,
  turningAxisKnob,
  keyPreview,
  showKeyPreview,
  mute,
  muted,
  setMute,
  solo,
  setSolo,
  velocity,
  setVelocity,
  setGrabbing,
  grabbing,
  shiftAmt,
  updateShift,
  previewShift,
  setShowKeyPreview,
  setShiftDirectionForward,
  doShift,
  axis,
  updateAxis,
  startChangingAxis,
  stopChangingAxis,
  doFlip,
  previewFlip,
  doOpposite,
  previewOpposite,
  playingNote,
  noteOn,
  rangeStart,
  setRangeStart,
  rangeEnd,
  setRangeEnd,
  resizing,
  setResizing,
  setKeyRate,
  keyRate,
  setKeyArpMode,
  keyArpMode,
  keyArpInc1,
  setKeyArpInc1,
  keyArpInc2,
  setKeyArpInc2,
  keySustain,
  setKeySustain,
  keySwing,
  setKeySwing,
  keySwingLength,
  setKeySwingLength,
  seqLength,
  setSeqLength,
  setSeqRate,
  seqRate,
  setSeqArpMode,
  seqArpMode,
  seqArpInc1,
  setSeqArpInc1,
  seqArpInc2,
  setSeqArpInc2,
  seqSwing,
  setSeqSwing,
  seqSwingLength,
  setSeqSwingLength,
  seqSustain,
  setSeqSustain,
  setLegato,
  legato,
  instrumentOn,
  setInstrumentOn,
  instrumentType,
  setInstrumentType,
  keyViewType,
  setKeyViewType,
  duplicateChannel,
  deleteChannel,
  drag,
  draggingChannel,
  linearKnobs,
  theme,
  seqRestart,
  seqOpposite,
  rangeMode,
  setRangeMode,
  keybdPitches,
  setKeybdPitches
) {
  const channelNumEl = useCallback(
    (auxiliary) => {
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

  const muteSoloEl = useMemo(() => {
    return <MuteSolo mute={mute} setMute={setMute} solo={solo} setSolo={setSolo} />
  }, [mute, setMute, setSolo, solo])

  const velocityEl = useMemo(() => {
    return (
      <Fader
        className="channel-module"
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
    (clock) => {
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
          linearKnobs={linearKnobs}
          theme={theme}
        />
      )
    },
    [
      axis,
      grabbing,
      key,
      keyPreview,
      linearKnobs,
      muted,
      playingPitchClass,
      setKey,
      setPlayingPitchClass,
      showKeyPreview,
      startChangingAxis,
      stopChangingAxis,
      theme,
      turningAxisKnob,
      updateAxis,
    ]
  )

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

  const setRangeModeTrue = useCallback(() => setRangeMode(true), [setRangeMode])
  const setRangeModeFalse = useCallback(() => setRangeMode(false), [setRangeMode])
  const notesModeEl = useMemo(() => {
    return (
      <div className="notes-mode">
        <Switch
          className="switch"
          onChange={setRangeMode}
          checked={rangeMode}
          uncheckedIcon={false}
          checkedIcon={false}
          offColor={offColor}
          onColor={onColor}
          offHandleColor={onHandleColor}
          onHandleColor={onHandleColor}
          width={46}
          height={24}
        />
        <div className="notes-mode-labels">
          <p
            onClick={setRangeModeTrue}
            className={classNames('notes-mode-label', { 'notes-mode-selected': rangeMode })}>
            Range
          </p>
          <p
            onClick={setRangeModeFalse}
            className={classNames('notes-mode-label', { 'notes-mode-selected': !rangeMode })}>
            Keybd
          </p>
        </div>
        <p className="notes-mode-title">Mode</p>
      </div>
    )
  }, [offColor, onColor, onHandleColor, rangeMode, setRangeModeFalse, setRangeModeTrue, setRangeMode])

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

  const keyRateEl = useMemo(() => {
    return (
      <Dropdn
        className="channel-module key-rate"
        label="Rate"
        options={RATES}
        setValue={setKeyRate}
        value={keyRate}
        noTextTransform
      />
    )
  }, [keyRate, setKeyRate])

  const arpModes = useMemo(() => Object.keys(ARP_MODES), [])

  const keyArpModeEl = useMemo(() => {
    return (
      <Dropdn
        className="channel-module key-arp-mode"
        label="Arp Mode"
        options={arpModes}
        setValue={setKeyArpMode}
        value={keyArpMode}
        showNumInputs={keyArpMode === '+/-'}
        num1={keyArpInc1}
        setNum1={setKeyArpInc1}
        num2={keyArpInc2}
        setNum2={setKeyArpInc2}
      />
    )
  }, [arpModes, keyArpInc1, keyArpInc2, keyArpMode, setKeyArpInc1, setKeyArpInc2, setKeyArpMode])

  const keySustainEl = useCallback(
    (vertical) => {
      return (
        <RotaryKnob
          min={SUSTAIN_MIN}
          className="channel-module key-sustain"
          value={keySustain}
          setValue={setKeySustain}
          label="Sustain"
          setGrabbing={setGrabbing}
          grabbing={grabbing}
          squeeze={!vertical ? 6 : 0}
          mute={muted}
          linearKnobs={linearKnobs}
          theme={theme}
        />
      )
    },
    [grabbing, keySustain, linearKnobs, muted, setGrabbing, setKeySustain, theme]
  )

  const keySwingEl = useCallback(
    (vertical) => {
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
            linearKnobs={linearKnobs}
            theme={theme}
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
    [grabbing, keySwing, keySwingLength, linearKnobs, mute, setGrabbing, setKeySwing, setKeySwingLength, theme]
  )

  const seqLengthEl = useCallback(
    (inline) => {
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

  const seqRateEl = useCallback(
    (inline) => {
      return (
        <Dropdn
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

  const seqArpModeEl = useCallback(
    (inline) => {
      return (
        <Dropdn
          className="channel-module seq-arp-mode"
          label="Seq Mode"
          options={arpModes}
          setValue={setSeqArpMode}
          value={seqArpMode}
          inline={inline}
          showNumInputs={seqArpMode === '+/-'}
          num1={seqArpInc1}
          setNum1={setSeqArpInc1}
          num2={seqArpInc2}
          setNum2={setSeqArpInc2}
        />
      )
    },
    [arpModes, seqArpInc1, seqArpInc2, seqArpMode, setSeqArpInc1, setSeqArpInc2, setSeqArpMode]
  )

  const seqSwingEl = useCallback(
    (inline) => {
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
            linearKnobs={linearKnobs}
            theme={theme}
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
    [grabbing, linearKnobs, mute, seqSwing, seqSwingLength, setGrabbing, setSeqSwing, setSeqSwingLength, theme]
  )

  const seqSustainEl = useCallback(
    (inline) => {
      return (
        <RotaryKnob
          min={SUSTAIN_MIN}
          className="channel-module"
          value={seqSustain}
          setValue={setSeqSustain}
          label="Sustain"
          setGrabbing={setGrabbing}
          grabbing={grabbing}
          inline={inline}
          mute={mute}
          linearKnobs={linearKnobs}
          theme={theme}
        />
      )
    },
    [grabbing, linearKnobs, mute, seqSustain, setGrabbing, setSeqSustain, theme]
  )

  const legatoEl = useCallback(
    (inline) => {
      return (
        <div className={classNames('switch-container channel-module', { inline })}>
          <Switch
            className="switch"
            onChange={setLegato}
            checked={legato}
            uncheckedIcon={false}
            checkedIcon={false}
            offColor={offColor}
            onColor={onColor}
            offHandleColor={offHandleColor}
            onHandleColor={onHandleColor}
            width={48}
            height={24}
          />
          <p className="switch-label">Legato</p>
        </div>
      )
    },
    [legato, offColor, offHandleColor, onColor, onHandleColor, setLegato]
  )

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

  const instrumentEl = useCallback(
    (small) => {
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
        />
      )
    },
    [instrumentOn, instrumentType, mute, setInstrumentOn, setInstrumentType, theme]
  )

  return {
    channelNumEl,
    duplicateDeleteEl,
    keyEl,
    muteSoloEl,
    velocityEl,
    shiftEl,
    axisEl,
    flipOppositeEl,
    pianoEl,
    keyRateEl,
    keyArpModeEl,
    keySustainEl,
    keySwingEl,
    seqLengthEl,
    seqRateEl,
    seqArpModeEl,
    seqSwingEl,
    seqSustainEl,
    legatoEl,
    instrumentEl,
    keyViewTypeEl,
    seqRestartEl,
    seqOppositeEl,
    notesModeEl,
  }
}
