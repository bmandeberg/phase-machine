import { useCallback } from 'react'
import { flip, opposite, shiftWrapper, shift } from '../math'
import { BLANK_PITCH_CLASSES } from '../globals'

// key manipulation functions

export default function useKeyManipulation(
  key,
  shiftAmt,
  shiftDirectionForward,
  setKeyPreview,
  setShowKeyPreview,
  setShiftAmt,
  setKey,
  setAxis,
  axis,
  setGrabbing,
  setTurningAxisKnob,
  setKeybdPitches,
  setPlayingNote,
  setPlayingPitchClass,
  playingNoteRef,
  noteIndex,
  prevNoteIndex,
) {
  const previewShift = useCallback(
    (forward = shiftDirectionForward, newShift = shiftAmt, previewKey = key) => {
      newShift = shiftWrapper(newShift, forward)
      setKeyPreview(shift(newShift, previewKey))
      setShowKeyPreview(true)
    },
    [key, setKeyPreview, setShowKeyPreview, shiftAmt, shiftDirectionForward]
  )

  const updateShift = useCallback(
    (newShift) => {
      newShift = shiftWrapper(newShift, shiftDirectionForward)
      setShiftAmt(newShift)
      previewShift(shiftDirectionForward, newShift)
    },
    [previewShift, setShiftAmt, shiftDirectionForward]
  )

  const doShift = useCallback(() => {
    const shiftedKey = shift(shiftAmt, key)
    setKey(shiftedKey)
    previewShift(shiftDirectionForward, shiftAmt, shiftedKey)
  }, [key, previewShift, setKey, shiftAmt, shiftDirectionForward])

  const doOpposite = useCallback(() => {
    setKey((key) => opposite(key))
    setKeyPreview(key)
  }, [key, setKey, setKeyPreview])

  const previewOpposite = useCallback(() => {
    setKeyPreview(opposite(key))
    setShowKeyPreview(true)
  }, [key, setKeyPreview, setShowKeyPreview])

  const updateAxis = useCallback(
    (a) => {
      setAxis(a)
      setKeyPreview(flip(a, key))
    },
    [key, setAxis, setKeyPreview]
  )

  const doFlip = useCallback(() => {
    setKey((key) => flip(axis, key))
    setKeyPreview(key)
  }, [axis, key, setKey, setKeyPreview])

  const previewFlip = useCallback(() => {
    setKeyPreview(flip(axis, key))
    setShowKeyPreview(true)
  }, [axis, key, setKeyPreview, setShowKeyPreview])

  const startChangingAxis = useCallback(() => {
    setGrabbing(true)
    setTurningAxisKnob(true)
    previewFlip()
  }, [previewFlip, setGrabbing, setTurningAxisKnob])

  const stopChangingAxis = useCallback(() => {
    setGrabbing(false)
    setTurningAxisKnob(false)
    setShowKeyPreview(false)
  }, [setGrabbing, setShowKeyPreview, setTurningAxisKnob])

  const clearNotes = useCallback(() => {
    setKey(BLANK_PITCH_CLASSES())
    setKeybdPitches([])
    setPlayingNote(undefined)
    setPlayingPitchClass(undefined)
    playingNoteRef.current = undefined
    noteIndex.current = undefined
    prevNoteIndex.current = undefined
  }, [noteIndex, playingNoteRef, prevNoteIndex, setKey, setKeybdPitches, setPlayingNote, setPlayingPitchClass])

  const restartNotes = useCallback(() => {
    setPlayingNote(undefined)
    setPlayingPitchClass(undefined)
    playingNoteRef.current = undefined
    noteIndex.current = undefined
    prevNoteIndex.current = undefined
  }, [noteIndex, playingNoteRef, prevNoteIndex, setPlayingNote, setPlayingPitchClass])

  return {
    previewShift,
    updateShift,
    doShift,
    doOpposite,
    previewOpposite,
    updateAxis,
    doFlip,
    previewFlip,
    startChangingAxis,
    stopChangingAxis,
    clearNotes,
    restartNotes,
  }
}
