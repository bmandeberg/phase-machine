import React, { useCallback, useEffect, useRef } from 'react'
import classNames from 'classnames'
import { resolveActiveDialog, getActiveDialog, DialogRequest } from '../dialog'
import './AlertDialog.scss'

// Presentational confirm/alert host for alertDialog() / confirmDialog(). App owns the
// active-dialog state (bridged from the dialog store with a plain subscribe) and renders
// this through a CSSTransition exactly like <Modal> — same .modal-* classes, same `show`
// transition, same #container parent (so theming applies natively). Mirroring the Modal
// matters: the earlier useSyncExternalStore + <body> portal version never rendered the
// dialog on iOS Safari, while the Modal (this pattern) shows fine there.
interface AlertDialogProps {
  nodeRef: React.RefObject<HTMLDivElement | null>
  dialog: DialogRequest | null
}

export default function AlertDialog({ nodeRef, dialog: active }: AlertDialogProps) {
  // Keep rendering the last dialog while the exit animation plays (active is null by
  // then), mirroring how Modal retains modalTypeRef during its transition.
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
              <div className={classNames('button', dialog?.danger ? 'red-button' : 'green-button')} onClick={confirm}>
                {dialog?.confirmText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
