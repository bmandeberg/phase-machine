import React, { useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import classNames from 'classnames'
import Sequencer from '../Sequencer'
import { CHANNEL_HEIGHT } from '../../globals'
import { Setter } from '../../types'
import { UIElements } from '../../hooks/useUI'

// A pared-down variant of StackedView: same layout (a main channel row with the
// sequencer/instrument auxiliary block positioned below), but with most of the
// per-channel controls hidden for a denser overview. Mute/solo stack vertically
// (see `.channel-condensed` in Channel.scss). Hidden vs. StackedView: channel
// MIDI routing, velocity, the key transformations slot (shift/axis/flip/opposite
// in range mode, the MIDI-input/clear-reset controls in keyboard mode), sustain,
// the sequencer's opposite/shift/restart, and both swing-module Length inputs (the
// Swing knobs stay; the Length NumInputs are hidden via `.channel-condensed` in
// Channel.scss).
type CondensedViewProps = UIElements & {
  muted: boolean
  color: string
  channelNum: number
  numChannels: number
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
  numChannels,
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
  channelNumAux,
  channelButtonsEl,
  muteSoloEl,
  notesModeEl,
  keyEl,
  pianoEl,
  keyRateEl,
  keyMovementEl,
  keySwingNormal,
  seqLengthInline,
  seqRateInline,
  seqMovementInline,
  seqSwingInline,
  holdInline,
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
        {notesModeEl}
        {keyEl}
        {pianoEl}
        {keyRateEl}
        {keyMovementEl}
        {keySwingNormal}
        <div
          style={{ top: numChannels * CHANNEL_HEIGHT }}
          className={classNames('channel channel-horizontal channel-condensed stacked-auxiliary', {
            mute: muted,
            'first-auxiliary': channelNum === 0,
          })}>
          {scribblerEl}
          {channelNumAux}
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
              {seqSwingInline}
              {holdInline}
            </div>
          </Sequencer>
          <div className="channel-module border"></div>
          {instrumentNormal}
        </div>
        {draggingChannel && dragTarget !== channelNum && dragTargetHorizontal}
        {modalEl}
      </div>
    </CSSTransition>
  )
}

export default React.memo(CondensedView)
