/**
 * Protects the bilingual heading contract:
 *
 * - English display type is Fraunces (`.font-display`) on its own node.
 * - Thai display type is Noto Serif Thai (`.font-serif`) on a sibling with
 *   lang="th". Nesting Thai under Fraunces corrupts vowel/tone marks.
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
    en: 'Capture Moments Worth Showing Off',
    th: 'ออกไปเก็บภาพ ที่ทุกคนอยากดู',
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
  expect(thFont, `Thai font-family was: ${thFont}`).toMatch(/Noto Serif Thai/i)
  expect(thFont, `Thai must not inherit Fraunces: ${thFont}`).not.toMatch(/Fraunces/i)
  expect(enFont, `English font-family was: ${enFont}`).toMatch(/Fraunces/i)
}

test.describe('bilingual headings', () => {
  test('homepage Discover h1 uses BiDisplayHeading with Noto Serif Thai (not Fraunces)', async ({
    page,
  }) => {
    await page.goto('/')
    expect(new URL(page.url()).pathname).toBe('/')
    await assertBiDisplayHeading(page, COPY.discover.en, COPY.discover.th)
  })

  test('homepage keeps Capture Moments video section fonts', async ({ page }) => {
    await page.goto('/')
    const root = biHeading(page, COPY.home.en, COPY.home.th)
    await root.scrollIntoViewIfNeeded()
    await assertBiDisplayHeading(page, COPY.home.en, COPY.home.th)

    const thLine = root.locator('[lang="th"]')
    const thText = (await thLine.innerText()).trim()
    expect(thText, 'preceding vowel ไ').toContain('\u0E44')
    expect(thText, 'mai han-akat ็').toContain('\u0E47')
    expect(thText, 'sara ii + mai ek ี่').toContain('\u0E35\u0E48')
  })

  test('home hero Thai stays Noto Serif Thai when TH is primary', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('trip2talk_lang', 'th')
    })
    await page.goto('/')
    const root = biHeading(page, COPY.home.en, COPY.home.th)
    await root.scrollIntoViewIfNeeded()
    await expect(root).toBeVisible()

    async function order(): Promise<string[]> {
      return root.locator(':scope > [lang]').evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute('lang') ?? ''),
      )
    }

    await expect.poll(order).toEqual(['th', 'en'])
    await readyFonts(page)
    const thFont = await fontFamily(root.locator('[lang="th"]'))
    expect(thFont, `Thai font-family was: ${thFont}`).toMatch(/Noto Serif Thai/i)
    expect(thFont, `Thai must not inherit Fraunces: ${thFont}`).not.toMatch(/Fraunces/i)
    expect(thFont, `Thai must not inherit Geist: ${thFont}`).not.toMatch(/Geist/i)
  })

  test('/spots list page keeps bilingual heading fonts', async ({ page }) => {
    await page.goto('/spots')
    await expect(page).toHaveURL(/\/spots(?:\?|$)/)
    await assertBiDisplayHeading(page, COPY.spots.en, COPY.spots.th)
  })

  test('/discover redirects to homepage Discover content', async ({ page }) => {
    await page.goto('/discover')
    expect(new URL(page.url()).pathname).toBe('/')
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
    const root = biHeading(page, COPY.discover.en, COPY.discover.th)
    await expect(root).toBeVisible()

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
    await expect(root.locator('[lang="th"]')).toHaveText(COPY.discover.th)
    await expect(root.locator('[lang="en"]')).toHaveText(COPY.discover.en)

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
