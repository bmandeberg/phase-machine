import React, { useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import classNames from 'classnames'
import Sequencer from '../Sequencer'
import { Setter } from '../../types'
import { UIElements } from '../../hooks/useUI'

// A pared-down variant of HorizontalView: the same single inline row (key/piano →
// sequencer → instrument, all in one horizontally-scrolling channel), but with
// most per-channel controls hidden for a denser overview. Mute/solo stack
// vertically (see `.channel-condensed` in Channel.scss). Hidden vs. HorizontalView:
// channel MIDI routing, velocity, the range/keyboard MODE toggle, the key
// transformations slot (shift/axis/flip/opposite in range mode, the MIDI-input/
// clear-reset controls in keyboard mode), sustain, both Swing modules (knob +
// Length), and the sequencer's hold/opposite/shift/restart.
type CondensedViewProps = UIElements & {
  muted: boolean
  color: string
  channelNum: number
  seqSteps: boolean[]
  setSeqSteps: Setter<boolean[]>
  seqLength: number
  seqPreview: boolean[]
  showSeqPreview: boolean
  playingStep?: number
  showStepNumbers: boolean
  longestSequence: number
  draggingChannel: boolean
  dragTarget: number
  dragTargetHorizontal: React.ReactNode
  modalEl: React.ReactNode
}

function CondensedView({
  muted,
  color,
  channelNum,
  seqSteps,
  setSeqSteps,
  seqLength,
  seqPreview,
  showSeqPreview,
  playingStep,
  showStepNumbers,
  longestSequence,
  draggingChannel,
  dragTarget,
  dragTargetHorizontal,
  modalEl,
  scribblerEl,
  channelNumNormal,
  channelButtonsEl,
  muteSoloEl,
  keyEl,
  pianoEl,
  keyRateEl,
  keyMovementEl,
  seqLengthInline,
  seqRateInline,
  seqMovementInline,
  instrumentNormal,
}: CondensedViewProps) {
  const condensedViewRef = useRef<HTMLDivElement>(null)
  return (
    <CSSTransition
      timeout={400}
      in={true}
      appear={true}
      classNames={{ appear: 'channel-in', appearActive: 'channel-in-active', appearDone: 'channel-in-done' }}
      nodeRef={condensedViewRef}>
      <div
        ref={condensedViewRef}
        className={classNames('channel channel-horizontal channel-condensed', { mute: muted })}
        style={{ '--channel-color': color } as React.CSSProperties}>
        {scribblerEl}
        {channelNumNormal}
        {channelButtonsEl}
        <div className="channel-primary">{muteSoloEl}</div>
        {keyEl}
        {pianoEl}
        {keyRateEl}
        {keyMovementEl}
        <div className="channel-module border"></div>
        <Sequencer
          className="channel-module"
          seqSteps={seqSteps}
          setSeqSteps={setSeqSteps}
          seqLength={seqLength}
          seqPreview={seqPreview}
          showSeqPreview={showSeqPreview}
          playingStep={playingStep}
          showStepNumbers={showStepNumbers}
          longestSequence={longestSequence}>
          <div className="sequencer-controls">
            {seqLengthInline}
            {seqRateInline}
            {seqMovementInline}
          </div>
        </Sequencer>
        <div className="channel-module border"></div>
        {instrumentNormal}
        {draggingChannel && dragTarget !== channelNum && dragTargetHorizontal}
        {modalEl}
      </div>
    </CSSTransition>
  )
}

export default React.memo(CondensedView)
