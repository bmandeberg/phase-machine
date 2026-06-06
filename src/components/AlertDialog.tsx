import React, { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import classNames from 'classnames'
import { CSSTransition } from 'react-transition-group'
import { subscribeDialogs, getActiveDialog, resolveActiveDialog, DialogRequest } from '../dialog'
import './AlertDialog.scss'

// Single app-level host for alertDialog() / confirmDialog(). Reuses the Modal CSS
// (modal-container / modal-window / modal-header / modal-content + the `show`
// CSSTransition) so it matches the modal windows exactly, including theming via the
// #container ancestor's theme class.
export default function AlertDialog() {
  const active = useSyncExternalStore<DialogRequest | null>(subscribeDialogs, getActiveDialog, () => null)
  const nodeRef = useRef<HTMLDivElement>(null)

  // Keep rendering the last dialog while the exit animation plays (active is already
  // null by then), mirroring how Modal retains modalTypeRef during its transition.
  const lastRef = useRef<DialogRequest | null>(null)
  if (active) {
    lastRef.current = active
  }
  const dialog = lastRef.current

  const confirm = useCallback(() => resolveActiveDialog(true), [])
  const cancel = useCallback(() => resolveActiveDialog(false), [])

  // Clicking the scrim dismisses (cancel for a confirm — the safe, non-destructive choice).
  const clickScrim = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('alert-dialog-container')) {
      resolveActiveDialog(false)
    }
  }, [])

  // Capture-phase key handling so Enter/Escape act on the dialog and don't also reach
  // the underlying Modal's Escape handler (which would close it out from under us).
  useEffect(() => {
    function keydown(e: KeyboardEvent) {
      if (!getActiveDialog()) return
      if (e.key === 'Escape') {
        e.stopPropagation()
        resolveActiveDialog(false)
      } else if (e.key === 'Enter') {
        e.stopPropagation()
        resolveActiveDialog(true)
      }
    }
    document.addEventListener('keydown', keydown, true)
    return () => document.removeEventListener('keydown', keydown, true)
  }, [])

  return (
    <CSSTransition in={!!active} timeout={300} classNames="show" nodeRef={nodeRef}>
      <div className="modal-container alert-dialog-container" ref={nodeRef} onClick={clickScrim}>
        <div className="modal-buffer">
          <div className="modal-window alert-dialog-window">
            <div className="modal-header">
              <p>{dialog?.title}</p>
              <div className="modal-close" onClick={cancel}></div>
            </div>
            <div className="modal-content">
              <p className="alert-dialog-message">{dialog?.message}</p>
              <div className="alert-dialog-actions">
                {dialog?.kind === 'confirm' && (
                  <div className="button" onClick={cancel}>
                    {dialog?.cancelText}
                  </div>
                )}
                <div
                  className={classNames('button', dialog?.danger ? 'red-button' : 'green-button')}
                  onClick={confirm}>
                  {dialog?.confirmText}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CSSTransition>
  )
}
