// Behavioral regression harness for the running app — the pre-refactor safety net.
// Drives real user flows (transport, presets, channel CRUD, views, persistence)
// and asserts DOM/localStorage state. Cannot verify actual audio/MIDI output
// (headless) — it asserts that playback ADVANCES the playhead, not that it sounds.
//
// Usage: URL=http://localhost:3100/ node scripts/regression.mjs
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = process.env.URL || 'http://localhost:3100/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const results = []
const ok = (name, cond, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`)

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--window-size=1600,1000'],
  defaultViewport: { width: 1600, height: 1000 },
})
const page = await browser.newPage()
const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console.error: ' + m.text().split('\n')[0].slice(0, 160))
})
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 160)))

await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })
await page.waitForSelector('.channel', { timeout: 25000 })
await sleep(1200)

// ---- helpers ----
const count = (sel) => page.$$eval(sel, (els) => els.length)
const ls = (key) => page.evaluate((k) => window.localStorage.getItem(k), key)
const clickByText = (sel, text) =>
  page.evaluate(
    (sel, text) => {
      const el = [...document.querySelectorAll(sel)].find((e) => e.textContent.trim() === text)
      if (el) {
        el.click()
        return true
      }
      return false
    },
    sel,
    text
  )
const playingStepIndex = () =>
  page.evaluate(() => {
    const steps = [...document.querySelectorAll('.sequence-step')]
    return steps.findIndex((s) => s.classList.contains('playing'))
  })
// ---- 1. mount / render ----
const channels0 = await count('.channel')
ok('app mounted with channels', channels0 > 0, `channels=${channels0}`)
ok('sequencer steps render', (await count('.sequence-step')) > 0, `steps=${await count('.sequence-step')}`)

// ---- 2. views ----
{
  await clickByText('.radio-button', 'clock')
  await sleep(700)
  ok('clock view renders', (await count('.channel.channel-clock')) > 0, `clock=${await count('.channel.channel-clock')}`)
  await clickByText('.radio-button', 'horizontal')
  await sleep(700)
  ok('horizontal view renders', (await count('.channel.channel-horizontal')) > 0)
  await clickByText('.radio-button', 'stacked')
  await sleep(700)
  ok('stacked view renders', (await count('.channel.channel-horizontal')) > 0)
}

// ---- 3. transport (playhead advances on play, stops on stop) ----
{
  const idxBefore = await playingStepIndex()
  await page.click('#play-stop')
  await sleep(300)
  const seen = new Set()
  for (let i = 0; i < 14; i++) {
    seen.add(await playingStepIndex())
    await sleep(120)
  }
  const advanced = [...seen].filter((i) => i >= 0)
  ok('playhead advances during playback', advanced.length >= 2, `distinct playing steps seen=${advanced.length}`)
  await page.click('#play-stop') // stop
  await sleep(500)
  const idxAfterStop = await playingStepIndex()
  await sleep(400)
  ok('playback stops', idxAfterStop === (await playingStepIndex()), `idleBefore=${idxBefore}`)
}

// ---- 4. channel CRUD (add via the "+" button, delete via the channel menu) ----
{
  const base = await count('.channel')
  const addBtn = await page.$('.add-channel-button')
  if (!addBtn) {
    ok('found add-channel control', false)
  } else {
    ok('found add-channel control', true)
    await addBtn.click()
    await sleep(600)
    const added = await count('.channel')
    ok('add channel increases count', added > base, `${base} -> ${added}`)

    // delete the just-added (last) channel via its "..." menu → Delete Channel
    const menuButtons = await page.$$('.channel-menu-button')
    await menuButtons[menuButtons.length - 1].click()
    await sleep(200)
    const deleted = await clickByText('.channel-menu-item', 'Delete Channel')
    ok('found Delete Channel menu item', deleted)
    await sleep(600)
    const removed = await count('.channel')
    ok('remove channel restores count', removed === base, `${added} -> ${removed}`)
  }
}

// ---- 5. presets (new adds; edit marks dirty; save clears dirty) ----
{
  const presetsBefore = JSON.parse((await ls('presets')) || '[]').length
  await page.click('.preset-new')
  await sleep(600)
  const presetsAfterNew = JSON.parse((await ls('presets')) || '[]').length
  ok('new preset is created', presetsAfterNew === presetsBefore + 1, `${presetsBefore} -> ${presetsAfterNew}`)

  // edit something -> preset becomes dirty (a .preset-edited indicator appears)
  await page.click('.sequence-step')
  await sleep(300)
  const dirty = (await count('.preset-edited')) > 0 || !(await page.$('.preset-save.disabled'))
  ok('editing marks preset dirty', dirty)
  // save -> dirty cleared (save button disabled again)
  await page.click('.preset-save')
  await sleep(500)
  const cleared = (await count('.preset-edited')) === 0
  ok('saving clears dirty state', cleared)
}

// ---- 6. persistence (view survives reload) ----
{
  await clickByText('.radio-button', 'clock')
  await sleep(500)
  ok('view persisted to localStorage', (await ls('view')) === 'clock', `view=${await ls('view')}`)
  await page.reload({ waitUntil: 'networkidle2' })
  await page.waitForSelector('.channel', { timeout: 25000 })
  await sleep(1000)
  ok('view restored after reload', (await count('.channel.channel-clock')) > 0)
}

await page.screenshot({ path: '/tmp/pm-regression.png' })

const failed = results.filter((r) => r.startsWith('FAIL')).length
console.log('\n=== REGRESSION RESULTS ===\n' + results.join('\n'))
console.log('\n=== CONSOLE/PAGE ERRORS (' + errors.length + ') ===')
console.log(errors.length ? errors.slice(0, 25).join('\n') : '(none)')

await browser.close()
process.exit(failed || errors.length ? 1 : 0)
