import React, { useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import classNames from 'classnames'
import Sequencer from '../Sequencer'
import { Setter } from '../../types'
import { UIElements } from '../../hooks/useUI'

type HorizontalViewProps = UIElements & {
  muted: boolean
  color: string
  channelNum: number
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
  flash: boolean
  selected: boolean
  onWrapperMouseDown: (e: React.MouseEvent) => void
  onWrapperFocus: () => void
}

function HorizontalView({
  flash,
  muted,
  selected,
  onWrapperMouseDown,
  onWrapperFocus,
  color,
  channelNum,
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
  channelButtonsEl,
  muteSoloEl,
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
}: HorizontalViewProps) {
  const horizontalViewRef = useRef<HTMLDivElement>(null)
  return (
    <CSSTransition
      timeout={400}
      in={true}
      appear={flash}
      classNames={{ appear: 'channel-in', appearActive: 'channel-in-active', appearDone: 'channel-in-done' }}
      nodeRef={horizontalViewRef}>
      <div
        ref={horizontalViewRef}
        className={classNames('channel channel-horizontal', { mute: muted, selected })}
        onMouseDownCapture={onWrapperMouseDown}
        onFocusCapture={onWrapperFocus}
        style={{ '--channel-color': color } as React.CSSProperties}>
        <div className="channel-sticky">
          {scribblerEl}
          {channelNumNormal}
          {channelButtonsEl}
          <div className="channel-primary">{muteSoloEl}</div>
        </div>
        {/* The key-side group (key · piano · their controls). Wrapped so the Eclipse
            theme can render it as one rounded card; `.channel-section` is
            display:contents by default, so every other theme is unaffected. */}
        <div className="channel-section channel-section-key">
          {velocityEl}
          {notesModeEl}
          {keyEl}
          <div className="transformations">
            {rangeMode && shiftEl}
            {rangeMode && axisNormal}
            {rangeMode && (
              <img className="arrow-small" src={arrowSmallGraphic ?? undefined} alt="" draggable="false" />
            )}
            {rangeMode && flipOppositeEl}
            {!rangeMode && midiInputModeEl}
            {!rangeMode && clearResetEl}
          </div>
          {pianoEl}
          {keyRateEl}
          {keyMovementEl}
          {sustainNormal}
          {keySwingNormal}
        </div>
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
            {seqSwingInline}
            {holdInline}
            {seqRestartEl}
            {seqOppositeEl}
            {seqShiftInline}
          </div>
        </Sequencer>
        {draggingChannel && dragTarget !== channelNum && dragTargetHorizontal}
        {modalEl}
      </div>
    </CSSTransition>
  )
}

export default React.memo(HorizontalView)
