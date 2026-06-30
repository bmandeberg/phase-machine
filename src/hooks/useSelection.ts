import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Click-selection of channels. Owned by App and read by the views (for the `selected`
// highlight) and by the selection hotkeys / edit fan-out. Selection is a Set of channel
// ids; `anchorId` remembers the last single-click for shift-range selection.

export interface SelectionModifiers {
  shift?: boolean
  meta?: boolean
}

export interface SelectionAPI {
  selectedIds: Set<string>
  // stable read for the document-level hotkey handler + edit fan-out, so they never
  // close over a stale Set or need to re-subscribe on every selection change.
  selectedIdsRef: React.MutableRefObject<Set<string>>
  isSelected: (id: string) => boolean
  anySelected: () => boolean
  clickSelect: (id: string, mods: SelectionModifiers) => void
  selectOnly: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
}

export default function useSelection(orderedIds: string[]): SelectionAPI {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  // anchor for shift-range selection (the last channel single-clicked / cmd-clicked)
  const anchorId = useRef<string | null>(null)

  const selectedIdsRef = useRef(selectedIds)
  selectedIdsRef.current = selectedIds

  // Drop ids that no longer exist (a deleted channel, or one removed by shrinking the
  // channel count) so a ghost id can't linger in the selection or skew range math.
  useEffect(() => {
    setSelectedIds((prev) => {
      let changed = false
      const next = new Set<string>()
      prev.forEach((id) => {
        if (orderedIds.includes(id)) next.add(id)
        else changed = true
      })
      return changed ? next : prev
    })
    if (anchorId.current && !orderedIds.includes(anchorId.current)) anchorId.current = null
  }, [orderedIds])

  const selectOnly = useCallback((id: string) => {
    setSelectedIds(new Set([id]))
    anchorId.current = id
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedIds((prev) => (prev.size ? new Set() : prev))
    anchorId.current = null
  }, [])

  // Select every channel (Cmd/Ctrl+A). Anchor the last one so a follow-up shift-click
  // narrows the range from the end.
  const selectAll = useCallback(() => {
    setSelectedIds(new Set(orderedIds))
    anchorId.current = orderedIds.length ? orderedIds[orderedIds.length - 1] : null
  }, [orderedIds])

  const clickSelect = useCallback(
    (id: string, mods: SelectionModifiers) => {
      // cmd/ctrl: toggle this channel in/out of the selection; it becomes the new anchor
      if (mods.meta) {
        setSelectedIds((prev) => {
          const next = new Set(prev)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
        anchorId.current = id
        return
      }
      // shift: inclusive range between the anchor and this channel, in channel order.
      // The anchor stays put so the range can be grown/shrunk with repeated shift-clicks.
      if (mods.shift) {
        const anchor = anchorId.current ?? id
        const from = orderedIds.indexOf(anchor)
        const to = orderedIds.indexOf(id)
        if (from === -1 || to === -1) {
          selectOnly(id)
          return
        }
        const [lo, hi] = from <= to ? [from, to] : [to, from]
        setSelectedIds(new Set(orderedIds.slice(lo, hi + 1)))
        anchorId.current = anchor
        return
      }
      selectOnly(id)
    },
    [orderedIds, selectOnly]
  )

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds])
  const anySelected = useCallback(() => selectedIdsRef.current.size > 0, [])

  return useMemo(
    () => ({ selectedIds, selectedIdsRef, isSelected, anySelected, clickSelect, selectOnly, selectAll, deselectAll }),
    [selectedIds, isSelected, anySelected, clickSelect, selectOnly, selectAll, deselectAll]
  )
}
