// Imperative, non-blocking replacement for window.alert / window.confirm.
//
// Native alert/confirm freeze the main thread, which stalls Tone.js scheduling and
// stops the audio transport. These enqueue a request that <AlertDialog> renders as a
// themed in-app modal and resolve a Promise when the user responds — so audio keeps
// playing. Callable from anywhere (components, hooks, and plain module code), not just
// React render, because the store lives outside the React tree.

export type DialogKind = 'alert' | 'confirm'

export interface DialogRequest {
  kind: DialogKind
  message: string
  title: string
  confirmText: string
  cancelText: string
  danger: boolean
  resolve: (value: boolean) => void
}

export interface DialogOptions {
  title?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

let queue: DialogRequest[] = []
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribeDialogs(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// The active dialog is the head of the queue (stable reference until it resolves, so
// it's safe as a useSyncExternalStore snapshot). Returns null when nothing is pending.
export function getActiveDialog(): DialogRequest | null {
  return queue[0] ?? null
}

export function resolveActiveDialog(value: boolean) {
  const active = queue[0]
  if (!active) return
  queue = queue.slice(1)
  emit()
  active.resolve(value)
}

function enqueue(kind: DialogKind, message: string, options: DialogOptions = {}): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    queue = [
      ...queue,
      {
        kind,
        message,
        title: options.title ?? (kind === 'confirm' ? 'Confirm' : 'Alert'),
        confirmText: options.confirmText ?? 'OK',
        cancelText: options.cancelText ?? 'Cancel',
        danger: !!options.danger,
        resolve,
      },
    ]
    emit()
  })
}

// Drop-in for window.alert — informational, resolves when dismissed.
export function alertDialog(message: string, options?: Pick<DialogOptions, 'title' | 'confirmText'>): Promise<void> {
  return enqueue('alert', message, options).then(() => undefined)
}

// Drop-in for window.confirm — resolves true on confirm, false on cancel/dismiss.
export function confirmDialog(message: string, options?: DialogOptions): Promise<boolean> {
  return enqueue('confirm', message, options)
}
