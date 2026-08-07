import { describe, it, expect } from 'vitest'
import * as sass from 'sass'
import fs from 'node:fs'
import path from 'node:path'

// Guards the invariant set up in sass-globals.scss: every :hover rule ships inside a
// `(hover: hover)` media query, so touch browsers — which latch :hover onto a tapped
// element until you tap elsewhere — never apply one. There is no ESLint on this project
// and neither tsc nor next build can see SCSS selectors, so without this the 269 gated
// rules would decay one hand-written `&:hover` at a time, and the damage would only ever
// show up on someone's phone.
//
// It asserts against COMPILED css rather than the scss source on purpose: that sees
// through @include hover / @include can-hover, through nesting, and through @extend, so
// it can't be fooled by a new spelling of the same gate.

const scssFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? scssFiles(p) : p.endsWith('.scss') ? [p] : []
  })

function ungatedHoverRules(file: string): string[] {
  const css = sass.compile(file, { style: 'expanded' }).css
  const ungated: string[] = []
  const stack: (string | null)[] = []
  let pending: string[] = []

  for (const line of css.split('\n')) {
    const s = line.trim()
    if (s.endsWith('{')) {
      const head = [...pending, s.slice(0, -1)].join(' ').trim()
      pending = []
      if (head.startsWith('@media')) {
        stack.push(head)
      } else {
        if (head.includes(':hover') && !stack.some((c) => c?.includes('(hover: hover)'))) {
          ungated.push(head)
        }
        stack.push(null) // a style rule — its body is declarations, not selectors
      }
    } else if (s === '}') {
      stack.pop()
    } else if (stack[stack.length - 1] !== null) {
      pending.push(s) // continuation of a multi-line selector list
    }
  }
  return ungated
}

describe('every :hover rule is gated behind (hover: hover)', () => {
  const files = scssFiles('src')

  it('finds the stylesheets to check', () => {
    expect(files.length).toBeGreaterThan(20)
  })

  for (const file of files) {
    it(`${file} has no ungated :hover`, () => {
      expect(ungatedHoverRules(file)).toEqual([])
    })
  }
})
