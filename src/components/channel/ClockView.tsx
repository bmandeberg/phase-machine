import React, { useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import classNames from 'classnames'
import Sequencer from '../Sequencer'
import { Setter } from '../../types'
import { UIElements } from '../../hooks/useUI'

type ClockViewProps = UIElements & {
  muted: boolean
  color: string
  channelNum: number
  rangeMode: boolean
  arrowClockGraphic: string | null
  seqSteps: boolean[]
  setSeqSteps: Setter<boolean[]>
  seqLength: number
  playingStep?: number
  showStepNumbers: boolean
  draggingChannel: boolean
  dragTarget: number
  dragTargetBox: React.ReactNode
  modalEl: React.ReactNode
  drawerOpen: boolean
  toggleDrawerOpen: () => void
}

function ClockView({
  muted,
  color,
  channelNum,
  rangeMode,
  arrowClockGraphic,
  seqSteps,
  setSeqSteps,
  seqLength,
  playingStep,
  showStepNumbers,
  draggingChannel,
  dragTarget,
  dragTargetBox,
  modalEl,
  drawerOpen,
  toggleDrawerOpen,
  scribblerEl,
  channelNumNormal,
  duplicateDeleteEl,
  muteSoloEl,
  midiEl,
  velocityEl,
  notesModeEl,
  shiftEl,
  flipOppositeEl,
  midiInputModeEl,
  clearResetEl,
  axisClock,
  keyMovementEl,
  keyRateEl,
  sustainVertical,
  keySwingVertical,
  pianoEl,
  seqLengthNormal,
  seqRateNormal,
  seqMovementNormal,
  seqSwingNormal,
  holdNormal,
  seqOppositeRestartEl,
  instrumentSmall,
}: ClockViewProps) {
  const clockViewRef = useRef<HTMLDivElement>(null)
  const drawerNodeRef = useRef<HTMLDivElement>(null)
  return (
    <CSSTransition
      timeout={400}
      in={true}
      appear={true}
      classNames={{ appear: 'channel-in', appearActive: 'channel-in-active', appearDone: 'channel-in-done' }}
      nodeRef={clockViewRef}>
      <div
        ref={clockViewRef}
        className={classNames('channel channel-clock', { mute: muted })}
        style={{ '--channel-color': color } as React.CSSProperties}>
        <div className="channel-clock-top">
          {scribblerEl}
          {channelNumNormal}
          {duplicateDeleteEl}
          <div className="channel-primary">
            {muteSoloEl}
            {midiEl}
            {velocityEl}
          </div>
          <div className="channel-vertical left-vertical">
            {notesModeEl}
            {rangeMode && shiftEl}
            {rangeMode && flipOppositeEl}
            {!rangeMode && midiInputModeEl}
            {!rangeMode && clearResetEl}
            {/* {keyViewTypeEl} */}
          </div>
          {rangeMode && <img className="arrow-clock" src={arrowClockGraphic ?? undefined} alt="" />}
          {axisClock}
          <div className="channel-vertical">
            {keyMovementEl}
            <div>
              {keyRateEl}
              {sustainVertical}
            </div>
            {keySwingVertical}
          </div>
          <div
            className={classNames('channel-drawer-control', { 'drawer-open': drawerOpen })}
            onClick={toggleDrawerOpen}>
            <div className="arrow-down"></div>
          </div>
        </div>
        <CSSTransition in={drawerOpen} timeout={300} classNames="drawer-open" nodeRef={drawerNodeRef}>
          <div
            ref={drawerNodeRef}
            className={classNames('channel-clock-bottom', { 'drawer-open': drawerOpen })}
            style={{ '--drawer-height': 251 + Math.floor(seqLength / 16) * (22 + 16) + 'px' } as React.CSSProperties}>
            <div className="piano-container">{pianoEl}</div>
            <div className="piano-drawer-border"></div>
            <Sequencer
              className="channel-module"
              seqSteps={seqSteps}
              setSeqSteps={setSeqSteps}
              seqLength={seqLength}
              playingStep={playingStep}
              showStepNumbers={showStepNumbers}
            />
            <div className="sequencer-controls">
              {seqLengthNormal}
              {seqRateNormal}
              {seqMovementNormal}
              {seqSwingNormal}
              {holdNormal}
              {seqOppositeRestartEl}
              {instrumentSmall}
            </div>
          </div>
        </CSSTransition>
        {draggingChannel && dragTarget !== channelNum && dragTargetBox}
        {modalEl}
      </div>
    </CSSTransition>
  )
}

export default React.memo(ClockView)
