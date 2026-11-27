/**
 * Protects the bilingual heading contract:
 *
 * - English display type is Bricolage Grotesque (`.font-display`) on its own node.
 * - Thai display type is Kanit (`.font-serif`) on a sibling with
 *   lang="th". Nesting Thai under the Latin display font corrupts vowel/tone marks.
 * - Both languages stay in the DOM and visible. The EN/TH nav pill only
 *   swaps which line is primary (order + emphasis), never hides a language.
 * - Chrome strings that use t() (e.g. Book Now / จองเลย) do switch fully.
 *
 * If you change BiDisplayHeading, BiText, or font CSS, keep these passing.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'

const THAI_RANGE = /[\u0E00-\u0E7F]/
const REPLACEMENT = /\uFFFD/

const COPY = {
  home: {
    en: 'real photographer',
    th: 'ช่างภาพตัวจริง',
  },
  discover: { en: '101 Frames', th: '101 มุมกล้อง' },
  spots: { en: 'Photo Spots', th: 'พิกัดถ่ายภาพ' },
  trips: { en: 'Find Your Trip', th: 'เลือกทริปของคุณ' },
  pricing: { en: 'Pricing', th: 'ราคา' },
} as const

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('trip2talk_lang', 'en')
  })
})

function biHeading(page: Page, en: string, th: string): Locator {
  return page.locator('[data-bi-heading]').filter({ hasText: en }).filter({ hasText: th }).first()
}

async function readyFonts(page: Page) {
  await page.evaluate(() => document.fonts.ready)
}

async function fontFamily(el: Locator): Promise<string> {
  return el.evaluate((node) => getComputedStyle(node).fontFamily)
}

async function assertThaiNotMojibake(text: string) {
  expect(text, 'Thai should not contain replacement characters').not.toMatch(REPLACEMENT)
  expect(text, 'Thai should include Thai Unicode letters/vowels/tone marks').toMatch(THAI_RANGE)
}

async function assertBiDisplayHeading(page: Page, en: string, th: string) {
  const root = biHeading(page, en, th)
  await expect(root).toBeVisible()

  const enLine = root.locator('[lang="en"]')
  const thLine = root.locator('[lang="th"]')
  await expect(enLine).toBeVisible()
  await expect(thLine).toBeVisible()
  await expect(enLine).toHaveText(en)
  await expect(thLine).toHaveText(th)

  const thText = (await thLine.innerText()).trim()
  await assertThaiNotMojibake(thText)

  await readyFonts(page)
  const thFont = await fontFamily(thLine)
  const enFont = await fontFamily(enLine)
  expect(thFont, `Thai font-family was: ${thFont}`).toMatch(/Kanit/i)
  expect(thFont, `Thai must not inherit Bricolage: ${thFont}`).not.toMatch(/Bricolage/i)
  expect(enFont, `English font-family was: ${enFont}`).toMatch(/Bricolage/i)
}

test.describe('bilingual headings', () => {
  test('homepage hero h1 is the v7 photographer headline', async ({ page }) => {
    await page.goto('/')
    expect(new URL(page.url()).pathname).toBe('/')
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    await expect(h1).toContainText(COPY.home.en)
    await expect(h1).toContainText(COPY.home.th)
    await readyFonts(page)
    const thFont = await fontFamily(h1.locator('[lang="th"]'))
    const enFont = await fontFamily(h1.locator('[lang="en"]'))
    expect(thFont).toMatch(/Kanit/i)
    expect(enFont).toMatch(/Bricolage/i)
  })

  test('homepage no longer renders Capture Moments or the old 101 Frames hero', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /real photographer/i })).toBeVisible()
    await expect(page.getByText('Capture Moments')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: '101 Frames' })).toHaveCount(0)
  })

  test('home hero Thai stays Kanit when TH is primary', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('trip2talk_lang', 'th')
    })
    await page.goto('/')
    const root = page.locator('h1').first()
    await expect(root).toBeVisible()

    async function order(): Promise<string[]> {
      return root.locator(':scope > [lang]').evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute('lang') ?? ''),
      )
    }

    await expect.poll(order).toEqual(['th', 'en'])
    await readyFonts(page)
    const thFont = await fontFamily(root.locator('[lang="th"]'))
    expect(thFont, `Thai font-family was: ${thFont}`).toMatch(/Kanit/i)
    expect(thFont, `Thai must not inherit Bricolage: ${thFont}`).not.toMatch(/Bricolage/i)
  })

  test('/spots list page keeps bilingual heading fonts', async ({ page }) => {
    await page.goto('/spots')
    await expect(page).toHaveURL(/\/spots(?:\?|$)/)
    await assertBiDisplayHeading(page, COPY.spots.en, COPY.spots.th)
  })

  test('/discover is its own page with the photo-spot headline', async ({ page }) => {
    await page.goto('/discover')
    expect(new URL(page.url()).pathname).toBe('/discover')
    await assertBiDisplayHeading(page, COPY.discover.en, COPY.discover.th)
  })

  test('trips listing BiDisplayHeading keeps both languages and correct fonts', async ({ page }) => {
    await page.goto('/trips')
    await assertBiDisplayHeading(page, COPY.trips.en, COPY.trips.th)
  })

  test('pricing heading shows both languages (BiText) without mojibake', async ({ page }) => {
    await page.goto('/pricing')
    const h1 = page.locator('h1').filter({ hasText: COPY.pricing.en }).filter({ hasText: COPY.pricing.th })
    await expect(h1).toBeVisible()
    await expect(h1).toContainText(COPY.pricing.en)
    await expect(h1).toContainText(COPY.pricing.th)
    await assertThaiNotMojibake(await h1.innerText())
  })

  test('trip detail shows English and Thai names without mojibake', async ({ page }) => {
    await page.goto('/trips')
    const tripLink = page.locator('a[href^="/trips/"]').first()
    await expect(tripLink).toBeVisible()
    await tripLink.click()
    await expect(page).toHaveURL(/\/trips\/[^/]+$/)

    const title = page.locator('h1').filter({ hasNotText: THAI_RANGE }).first()
    await expect(title).toBeVisible()
    expect((await title.innerText()).trim().length).toBeGreaterThan(0)

    const thaiName = page.locator('h1 + p.font-thai, h1 span.font-medium').filter({ hasText: THAI_RANGE }).first()
    await expect(thaiName).toBeVisible()
    await assertThaiNotMojibake(await thaiName.innerText())
  })

  test('EN/TH pill reorders BiDisplayHeading primary line without hiding either language', async ({
    page,
  }) => {
    await page.goto('/')
    const root = page.locator('h1').first()
    await expect(root).toBeVisible()
    await expect(root).toContainText(COPY.home.en)
    await expect(root).toContainText(COPY.home.th)

    const group = page.getByRole('group', { name: 'Language' })
    await expect(group).toBeVisible()

    async function order(): Promise<string[]> {
      return root.locator(':scope > [lang]').evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute('lang') ?? ''),
      )
    }

    await expect.poll(order).toEqual(['en', 'th'])
    await expect(root.locator('[lang="en"]')).toBeVisible()
    await expect(root.locator('[lang="th"]')).toBeVisible()

    await group.getByRole('button', { name: 'TH', exact: true }).click()
    await expect.poll(order).toEqual(['th', 'en'])
    await expect(root.locator('[lang="en"]')).toBeVisible()
    await expect(root.locator('[lang="th"]')).toBeVisible()
    await expect(root.locator('[lang="th"]')).toContainText(COPY.home.th)
    await expect(root.locator('[lang="en"]')).toContainText(COPY.home.en)

    await group.getByRole('button', { name: 'EN', exact: true }).click()
    await expect.poll(order).toEqual(['en', 'th'])
    await expect(root.locator('[lang="en"]')).toBeVisible()
    await expect(root.locator('[lang="th"]')).toBeVisible()
  })

  test('nav CTA is single-language chrome (Book Now / จองเลย)', async ({ page }) => {
    await page.goto('/')
    const cta = page.locator('a.nav-cta')
    await expect(cta).toBeVisible()
    await expect(cta).toHaveText('Book Now')
    await expect(cta).not.toContainText('จองเลย')

    await page.getByRole('group', { name: 'Language' }).getByRole('button', { name: 'TH', exact: true }).click()
    await expect(cta).toHaveText('จองเลย')
    await expect(cta).not.toContainText('Book Now')

    await page.getByRole('group', { name: 'Language' }).getByRole('button', { name: 'EN', exact: true }).click()
    await expect(cta).toHaveText('Book Now')
  })
})
