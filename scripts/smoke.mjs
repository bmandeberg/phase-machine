// Headless smoke test for the running dev/prod app.
// Usage: URL=http://localhost:3100/ node scripts/smoke.mjs
// Requires a Chrome/Chromium install; override with CHROME_PATH.
import puppeteer from 'puppeteer-core'

const CHROME =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = process.env.URL || 'http://localhost:3000/'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--window-size=1600,1000'],
  defaultViewport: { width: 1600, height: 1000 },
})
const page = await browser.newPage()

const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console.error: ' + m.text().split('\n')[0])
})
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForSelector('.fader', { timeout: 25000 })
await new Promise((r) => setTimeout(r, 1500))

const results = []
const ok = (name, cond, extra = '') =>
  results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`)

const diag = await page.evaluate(() => ({
  rootChildren: document.getElementById('root')?.children.length ?? -1,
  faders: document.querySelectorAll('.fader').length,
  knobs: document.querySelectorAll('.knob').length,
}))
ok('app mounted', diag.rootChildren > 0, `#root children=${diag.rootChildren}`)
ok('faders present', diag.faders > 0, `count=${diag.faders}`)

// Fader drag (@use-gesture)
{
  const before = await page.$eval('.fader .fader-knob', (el) => el.style.top)
  const box = await (await page.$('.fader')).boundingBox()
  const x = box.x + box.width / 2
  const y = box.y + 6
  await page.mouse.move(x, y)
  await page.mouse.down()
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(x, y + i * 4)
    await new Promise((r) => setTimeout(r, 12))
  }
  await page.mouse.up()
  await new Promise((r) => setTimeout(r, 200))
  const after = await page.$eval('.fader .fader-knob', (el) => el.style.top)
  ok('fader knob moved on drag', before !== after, `top ${before} -> ${after}`)
}

// Knob drag (RotaryKnob -> LinearKnob, @use-gesture); reads rotation transform.
if (diag.knobs > 0) {
  const getT = () => page.$eval('.knob svg [id="knob"]', (el) => el.getAttribute('transform'))
  const before = await getT()
  const box = await (await page.$('.knob')).boundingBox()
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  for (let i = 1; i <= 12; i++) {
    await page.mouse.move(x, y - i * 5)
    await new Promise((r) => setTimeout(r, 12))
  }
  await page.mouse.up()
  await new Promise((r) => setTimeout(r, 200))
  ok('knob rotated on drag', before !== (await getT()))
}

// Numeric input stepper (custom NumericInput replacing react-numeric-input)
{
  const sel = '.num-input .react-numeric-input'
  const has = await page.$(sel)
  if (!has) {
    ok('numeric input present', false)
  } else {
    ok('numeric input present', true)
    const readVal = () => page.$eval(sel + ' input', (el) => el.value)
    const before = await readVal()
    await page.click(sel + ' b:first-of-type') // increment
    await new Promise((r) => setTimeout(r, 120))
    const afterUp = await readVal()
    await page.click(sel + ' b:last-of-type') // decrement
    await new Promise((r) => setTimeout(r, 120))
    const afterDown = await readVal()
    ok('numeric stepper +/- works', afterUp !== before && afterDown === before, `${before} ->+ ${afterUp} ->- ${afterDown}`)
  }
}

await page.screenshot({ path: '/tmp/pm-smoke.png' })

const failed = results.filter((r) => r.startsWith('FAIL')).length
console.log('\n=== SMOKE RESULTS ===\n' + results.join('\n'))
console.log('\n=== CONSOLE/PAGE ERRORS (' + errors.length + ') ===')
console.log(errors.length ? errors.slice(0, 25).join('\n') : '(none)')

await browser.close()
process.exit(failed ? 1 : 0)
