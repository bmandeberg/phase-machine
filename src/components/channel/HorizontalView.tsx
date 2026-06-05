import React, { useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import classNames from 'classnames'
import Sequencer from '../Sequencer'
import { Setter } from '../../types'
import { UIElements } from '../../hooks/useUI'

type HorizontalViewProps = UIElements & {
  muted: boolean
  channelNum: number
  rangeMode: boolean
  arrowSmallGraphic: string | null
  seqSteps: boolean[]
  setSeqSteps: Setter<boolean[]>
  seqLength: number
  playingStep?: number
  showStepNumbers: boolean
  longestSequence: number
  draggingChannel: boolean
  dragTarget: number
  dragTargetHorizontal: React.ReactNode
  modalEl: React.ReactNode
}

function HorizontalView({
  muted,
  channelNum,
  rangeMode,
  arrowSmallGraphic,
  seqSteps,
  setSeqSteps,
  seqLength,
  playingStep,
  showStepNumbers,
  longestSequence,
  draggingChannel,
  dragTarget,
  dragTargetHorizontal,
  modalEl,
  scribblerEl,
  channelNumNormal,
  duplicateDeleteEl,
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
  seqRateInline,
  seqMovementInline,
  seqSwingInline,
  holdInline,
  seqRestartEl,
  seqOppositeEl,
  instrumentNormal,
}: HorizontalViewProps) {
  const horizontalViewRef = useRef<HTMLDivElement>(null)
  return (
    <CSSTransition
      timeout={400}
      in={true}
      appear={true}
      classNames={{ appear: 'channel-in', appearActive: 'channel-in-active', appearDone: 'channel-in-done' }}
      nodeRef={horizontalViewRef}>
      <div ref={horizontalViewRef} className={classNames('channel channel-horizontal', { mute: muted })}>
        {scribblerEl}
        {channelNumNormal}
        {duplicateDeleteEl}
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
        <div className="channel-module border"></div>
        <Sequencer
          className="channel-module"
          seqSteps={seqSteps}
          setSeqSteps={setSeqSteps}
          seqLength={seqLength}
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

export default React.memo(HorizontalView)
