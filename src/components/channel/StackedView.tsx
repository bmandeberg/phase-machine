import React, { useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import classNames from 'classnames'
import Sequencer from '../Sequencer'
import { CHANNEL_HEIGHT } from '../../globals'
import { Setter } from '../../types'
import { UIElements } from '../../hooks/useUI'

type StackedViewProps = UIElements & {
  muted: boolean
  color: string
  channelNum: number
  numChannels: number
  rangeMode: boolean
  arrowSmallGraphic: string | null
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

function StackedView({
  muted,
  color,
  channelNum,
  numChannels,
  rangeMode,
  arrowSmallGraphic,
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
  midiEl,
  velocityEl,
  notesModeEl,
  keyEl,
  shiftEl,
  axisNormal,
  flipOppositeEl,
  midiInputModeEl,
  clearResetEl,
  pianoEl,
  keyRateEl,
  keyMovementEl,
  sustainNormal,
  keySwingNormal,
  seqLengthInline,
  seqShiftInline,
  seqRateInline,
  seqMovementInline,
  seqSwingInline,
  holdInline,
  seqRestartEl,
  seqOppositeEl,
  instrumentNormal,
}: StackedViewProps) {
  const stackedViewRef = useRef<HTMLDivElement>(null)
  return (
    <CSSTransition
      timeout={400}
      in={true}
      appear={true}
      classNames={{ appear: 'channel-in', appearActive: 'channel-in-active', appearDone: 'channel-in-done' }}
      nodeRef={stackedViewRef}>
      <div
        ref={stackedViewRef}
        className={classNames('channel channel-horizontal', { mute: muted })}
        style={{ '--channel-color': color } as React.CSSProperties}>
        {scribblerEl}
        {channelNumNormal}
        {channelButtonsEl}
        <div className="channel-primary">
          {muteSoloEl}
          {midiEl}
        </div>
        {velocityEl}
        {notesModeEl}
        {keyEl}
        <div className="transformations">
          {rangeMode && shiftEl}
          {rangeMode && axisNormal}
          {rangeMode && <img className="arrow-small" src={arrowSmallGraphic ?? undefined} alt="" draggable="false" />}
          {rangeMode && flipOppositeEl}
          {!rangeMode && midiInputModeEl}
          {!rangeMode && clearResetEl}
        </div>
        {pianoEl}
        {keyRateEl}
        {keyMovementEl}
        {sustainNormal}
        {keySwingNormal}
        <div
          style={{ top: numChannels * CHANNEL_HEIGHT }}
          className={classNames('channel channel-horizontal stacked-auxiliary', {
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
              {seqRestartEl}
              {seqOppositeEl}
              {seqShiftInline}
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

export default React.memo(StackedView)
