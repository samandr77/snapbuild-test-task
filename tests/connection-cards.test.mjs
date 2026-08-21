import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { after, before, describe, test } from 'node:test'
import { createServer } from 'vite'

const chromeCandidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)

const chromePath = chromeCandidates.find(existsSync)

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

function waitForBrowserEndpoint(processHandle) {
  return new Promise((resolve, reject) => {
    let output = ''
    const timeout = setTimeout(() => reject(new Error(`Chrome did not start:\n${output}`)), 10_000)

    processHandle.stderr.setEncoding('utf8')
    processHandle.stderr.on('data', (chunk) => {
      output += chunk
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/)
      if (!match) return

      clearTimeout(timeout)
      resolve(match[1])
    })

    processHandle.once('exit', (code) => {
      clearTimeout(timeout)
      reject(new Error(`Chrome exited before DevTools was ready (code ${code})`))
    })
  })
}

async function waitForPageEndpoint(browserEndpoint, pageUrl) {
  const { host } = new URL(browserEndpoint)

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const targets = await fetch(`http://${host}/json/list`).then((response) => response.json())
    const page = targets.find((target) => target.type === 'page' && target.url.startsWith(pageUrl))
    if (page) return page.webSocketDebuggerUrl
    await pause(50)
  }

  throw new Error(`Chrome did not open ${pageUrl}`)
}

class CdpClient {
  static async connect(url) {
    const socket = new WebSocket(url)
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true })
      socket.addEventListener('error', reject, { once: true })
    })
    return new CdpClient(socket)
  }

  constructor(socket) {
    this.socket = socket
    this.nextId = 0
    this.pending = new Map()

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (!message.id) return

      const request = this.pending.get(message.id)
      if (!request) return

      this.pending.delete(message.id)
      if (message.error) request.reject(new Error(message.error.message))
      else request.resolve(message.result)
    })
  }

  send(method, params = {}) {
    const id = ++this.nextId
    this.socket.send(JSON.stringify({ id, method, params }))

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
    })
  }

  close() {
    this.socket.close()
  }
}

describe('интерфейс сайта', { concurrency: false }, () => {
  let viteServer
  let chromeProcess
  let chromeProfile
  let client
  let pageUrl
  let navigationId = 0

  async function evaluate(expression) {
    const response = await client.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })

    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.exception?.description ?? 'Browser evaluation failed')
    }

    return response.result.value
  }

  async function waitForCards(expectedUrl = pageUrl) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const ready = await evaluate(`
        window.location.href === ${JSON.stringify(expectedUrl)} &&
        document.readyState === 'complete' &&
        document.querySelectorAll('.reveal-card.plan').length === 3
      `)
      if (ready) {
        await evaluate('document.fonts.ready.then(() => true)')
        return
      }
      await pause(50)
    }

    throw new Error('Tariff cards did not render')
  }

  async function useViewport(width, height) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    })
    const targetUrl = `${pageUrl}?ui-test=${++navigationId}`
    await client.send('Page.navigate', { url: targetUrl })
    await waitForCards(targetUrl)
  }

  async function waitForValue(expression, predicate, description) {
    const deadline = Date.now() + 2_000
    let value

    while (Date.now() < deadline) {
      value = await evaluate(expression)
      if (predicate(value)) return value
      await pause(25)
    }

    throw new Error(`Timed out waiting for ${description}; last value: ${JSON.stringify(value)}`)
  }

  before(async () => {
    assert.ok(chromePath, 'Google Chrome or Chromium is required for the UI test')

    viteServer = await createServer({
      logLevel: 'silent',
      server: { host: '127.0.0.1', port: 0 },
    })
    await viteServer.listen()

    const address = viteServer.httpServer.address()
    assert.ok(address && typeof address !== 'string')
    pageUrl = `http://127.0.0.1:${address.port}/`

    chromeProfile = mkdtempSync(join(tmpdir(), 'snapbuild-chrome-'))
    chromeProcess = spawn(
      chromePath,
      [
        '--headless=new',
        '--disable-background-networking',
        '--disable-gpu',
        '--no-default-browser-check',
        '--no-first-run',
        '--remote-debugging-port=0',
        `--user-data-dir=${chromeProfile}`,
        '--window-size=1440,1200',
        pageUrl,
      ],
      { stdio: ['ignore', 'ignore', 'pipe'] },
    )

    const browserEndpoint = await waitForBrowserEndpoint(chromeProcess)
    const pageEndpoint = await waitForPageEndpoint(browserEndpoint, pageUrl)
    client = await CdpClient.connect(pageEndpoint)
    await client.send('Runtime.enable')
    await client.send('Page.enable')
    await client.send('DOM.enable')
    await client.send('CSS.enable')
    pageUrl = await evaluate('window.location.href')
    await waitForCards()
  })

  after(async () => {
    client?.close()
    if (chromeProcess && chromeProcess.exitCode === null) {
      const exited = new Promise((resolve) => chromeProcess.once('exit', resolve))
      chromeProcess.kill('SIGTERM')
      await exited
    }
    await viteServer?.close()
    if (chromeProfile) rmSync(chromeProfile, { recursive: true, force: true })
  })

  test('названия тарифов визуально крупнее цен', async () => {
    await useViewport(1440, 1200)

    const sizes = await evaluate(`
      Array.from(document.querySelectorAll('.reveal-card.plan')).map((card) => ({
        name: Number.parseFloat(getComputedStyle(card.querySelector('.plan__name')).fontSize),
        price: Number.parseFloat(getComputedStyle(card.querySelector('.plan__amount')).fontSize),
      }))
    `)

    assert.equal(sizes.length, 3)
    for (const { name, price } of sizes) {
      assert.ok(name > price, `expected tariff name (${name}px) to be larger than price (${price}px)`)
    }
  })

  test('цена скрыта внутри карточки на десктопе и раскрывается при наведении', async () => {
    await useViewport(1440, 1200)

    const collapsed = await evaluate(`
      (() => {
        const price = document.querySelector('.plan__price')
        return {
          insideHead: price.closest('.reveal-card__head') !== null,
          opacity: Number.parseFloat(getComputedStyle(price).opacity),
        }
      })()
    `)

    assert.equal(collapsed.insideHead, false)
    assert.equal(collapsed.opacity, 0)

    await evaluate(`
      (() => {
        const card = document.querySelector('.reveal-card.plan')
        card.scrollIntoView({ block: 'center' })
        return true
      })()
    `)
    const { root } = await client.send('DOM.getDocument')
    const { nodeId } = await client.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: '.reveal-card.plan',
    })
    await client.send('CSS.forcePseudoState', {
      nodeId,
      forcedPseudoClasses: ['hover'],
    })

    const revealedOpacity = await waitForValue(
      `Number.parseFloat(getComputedStyle(document.querySelector('.plan__price')).opacity)`,
      (opacity) => opacity > 0.99,
      'the hovered card price to become visible',
    )
    assert.ok(revealedOpacity > 0.99)
  })

  test('клавиатурный фокус раскрывает цену внутри карточки', async () => {
    await useViewport(1440, 1200)

    const activeClass = await evaluate(`
      (() => {
        const cta = document.querySelector('.reveal-card.plan .plan__cta')
        cta.focus()
        return document.activeElement.className
      })()
    `)
    assert.match(activeClass, /plan__cta/)

    const focusedOpacity = await waitForValue(
      `Number.parseFloat(getComputedStyle(document.querySelector('.plan__price')).opacity)`,
      (opacity) => opacity > 0.99,
      'the focused card price to become visible',
    )
    assert.ok(focusedOpacity > 0.99)
  })

  test('на мобильном цена сразу видна внутри раскрытой карточки', async () => {
    await useViewport(390, 844)

    const mobileOpacity = await evaluate(
      `Number.parseFloat(getComputedStyle(document.querySelector('.plan__price')).opacity)`,
    )
    assert.equal(mobileOpacity, 1)
  })

  test('первый и финальный заголовки центрированы, остальные выровнены слева', async () => {
    for (const viewport of [
      { width: 1440, height: 1200 },
      { width: 390, height: 844 },
    ]) {
      await useViewport(viewport.width, viewport.height)

      const alignment = await evaluate(`
        (() => {
          const heroTitle = document.querySelector('#hero .hero__title')
          const ctaTitle = document.querySelector('#cta .cta__title')
          const headings = Array.from(document.querySelectorAll('main h2, main h3'))
            .filter((heading) => !heading.closest('#cta'))
          return {
            hero: getComputedStyle(heroTitle).textAlign,
            cta: getComputedStyle(ctaTitle).textAlign,
            headings: headings.map((heading) => ({
              text: heading.textContent.trim(),
              align: getComputedStyle(heading).textAlign,
            })),
          }
        })()
      `)

      assert.equal(alignment.hero, 'center')
      assert.equal(alignment.cta, 'center')
      assert.ok(alignment.headings.length > 10)

      const centered = alignment.headings.filter(({ align }) => !['left', 'start'].includes(align))
      assert.deepEqual(centered, [], `viewport ${viewport.width}px: ${JSON.stringify(centered)}`)
    }
  })

  test('подзаголовки секций следуют левому выравниванию заголовков', async () => {
    for (const viewport of [
      { width: 1440, height: 1200 },
      { width: 390, height: 844 },
    ]) {
      await useViewport(viewport.width, viewport.height)

      const subtitles = await evaluate(`
        Array.from(document.querySelectorAll('.section__subtitle')).map((subtitle) => ({
          text: subtitle.textContent.trim(),
          align: getComputedStyle(subtitle).textAlign,
        }))
      `)

      assert.ok(subtitles.length > 5)
      const centered = subtitles.filter(({ align }) => !['left', 'start'].includes(align))
      assert.deepEqual(centered, [], `viewport ${viewport.width}px: ${JSON.stringify(centered)}`)
    }
  })

  test('финальный CTA собран по центру', async () => {
    for (const viewport of [
      { width: 1440, height: 1200 },
      { width: 390, height: 844 },
    ]) {
      await useViewport(viewport.width, viewport.height)

      const ctaState = await evaluate(`
        (() => {
          const selectors = ['.cta__title', '.cta__actions']
          const ctaRect = document.querySelector('.cta')?.getBoundingClientRect()
          return {
            url: window.location.href,
            ctaExists: Boolean(document.querySelector('.cta')),
            center: ctaRect ? ctaRect.left + ctaRect.width / 2 : null,
            positions: selectors.map((selector) => ({
              selector,
              center: (() => {
                const rect = document.querySelector(selector)?.getBoundingClientRect()
                return rect ? rect.left + rect.width / 2 : null
              })(),
            })),
          }
        })()
      `)

      assert.ok(ctaState.ctaExists, JSON.stringify(ctaState))
      assert.notEqual(ctaState.center, null)
      assert.ok(ctaState.positions.every(({ center }) => center !== null), JSON.stringify(ctaState))
      const positions = ctaState.positions
      for (const position of positions) {
        assert.ok(
          Math.abs(position.center - ctaState.center) < 1,
          `viewport ${viewport.width}px: ${position.selector} centered at ${position.center}px instead of ${ctaState.center}px`,
        )
      }
    }
  })

  test('карусель отзывов выделяет центральную карточку и оставляет соседние видимыми', async () => {
    for (const viewport of [
      { width: 1440, height: 1200 },
      { width: 390, height: 844 },
    ]) {
      await useViewport(viewport.width, viewport.height)
      await evaluate(`
        (() => {
          document.querySelector('#reviews')?.scrollIntoView({ block: 'center' })
          return true
        })()
      `)
      await pause(100)

      const carousel = await evaluate(`
        (() => {
          const stage = document.querySelector('.review-carousel__stage')
          const cards = Array.from(document.querySelectorAll('.review-carousel__card'))
          if (!stage) return { cards: [] }

          const stageRect = stage.getBoundingClientRect()
          return {
            stageCenter: stageRect.left + stageRect.width / 2,
            cards: cards.map((card) => {
              const rect = card.getBoundingClientRect()
              return {
                id: card.dataset.id,
                active: card.dataset.active === 'true',
                position: Number(card.dataset.position),
                left: rect.left,
                right: rect.right,
                center: rect.left + rect.width / 2,
                width: rect.width,
                visibleWidth: Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0)),
              }
            }),
          }
        })()
      `)

      assert.equal(carousel.cards.length, 3)
      const active = carousel.cards.find((card) => card.active)
      const left = carousel.cards.find((card) => card.position === -1)
      const right = carousel.cards.find((card) => card.position === 1)

      assert.ok(active, `viewport ${viewport.width}px: active review is missing`)
      assert.ok(left, `viewport ${viewport.width}px: left review is missing`)
      assert.ok(right, `viewport ${viewport.width}px: right review is missing`)
      assert.ok(Math.abs(active.center - carousel.stageCenter) < 2)
      assert.ok(active.width > left.width * 1.12)
      assert.ok(active.width > right.width * 1.12)
      assert.ok(left.center < active.center)
      assert.ok(right.center > active.center)
      assert.ok(left.visibleWidth >= 24)
      assert.ok(right.visibleWidth >= 24)
    }
  })

  test('отзывы показывают локальные фотографии пользователей вместо инициалов', async () => {
    await useViewport(1440, 1200)

    const avatars = await evaluate(`
      Array.from(document.querySelectorAll('.review-carousel__card')).map((card) => {
        const container = card.querySelector('.review-carousel__avatar')
        const image = container?.querySelector('img')
        const containerRect = container?.getBoundingClientRect()
        const containerStyle = container ? getComputedStyle(container) : null
        const imageStyle = image ? getComputedStyle(image) : null

        return {
          id: card.dataset.id,
          hasImage: Boolean(image),
          loaded: Boolean(image?.complete && image.naturalWidth > 0),
          local: image ? new URL(image.currentSrc).origin === location.origin : false,
          source: image?.currentSrc ?? '',
          alt: image?.getAttribute('alt') ?? null,
          fallbackText: container?.textContent.trim() ?? '',
          width: containerRect?.width ?? 0,
          height: containerRect?.height ?? 0,
          borderRadius: Number.parseFloat(containerStyle?.borderRadius ?? '0'),
          objectFit: imageStyle?.objectFit ?? '',
        }
      })
    `)

    assert.equal(avatars.length, 3)
    assert.equal(new Set(avatars.map(({ source }) => source)).size, 3)
    for (const avatar of avatars) {
      assert.equal(avatar.hasImage, true, JSON.stringify(avatar))
      assert.equal(avatar.loaded, true, JSON.stringify(avatar))
      assert.equal(avatar.local, true, JSON.stringify(avatar))
      assert.equal(avatar.alt, '')
      assert.equal(avatar.fallbackText, '')
      assert.ok(Math.abs(avatar.width - avatar.height) < 1, JSON.stringify(avatar))
      assert.ok(avatar.borderRadius >= avatar.width / 2 - 1, JSON.stringify(avatar))
      assert.equal(avatar.objectFit, 'cover')
    }
  })

  test('кнопка следующего отзыва сдвигает карусель на одну карточку', async () => {
    await useViewport(1440, 1200)

    const initial = await evaluate(`
      (() => {
        const next = document.querySelector('[aria-label="Следующий отзыв"]')
        return {
          hasControl: Boolean(next),
          activeId: document.querySelector('.review-carousel__card[data-active="true"]')?.dataset.id,
        }
      })()
    `)

    assert.equal(initial.hasControl, true)
    assert.equal(initial.activeId, 'ozon')
    await evaluate(`document.querySelector('[aria-label="Следующий отзыв"]').click()`)

    const activeId = await waitForValue(
      `document.querySelector('.review-carousel__card[data-active="true"]')?.dataset.id`,
      (id) => id === 'cian',
      'the next testimonial to become active',
    )
    assert.equal(activeId, 'cian')
  })

  test('кнопки карусели повторяют оформление основной CTA', async () => {
    await useViewport(1440, 1200)

    const controls = await evaluate(`
      Array.from(document.querySelectorAll('.review-carousel__nav')).map((button) => {
        const buttonStyle = getComputedStyle(button)
        const label = button.querySelector('.btn__label')
        const labelStyle = label ? getComputedStyle(label) : null
        const rect = button.getBoundingClientRect()

        return {
          className: button.className,
          backgroundColor: buttonStyle.backgroundColor,
          borderRadius: Number.parseFloat(buttonStyle.borderRadius),
          height: rect.height,
          boxShadow: buttonStyle.boxShadow,
          hasAnimatedLabel: Boolean(label),
          labelBackground: labelStyle?.backgroundImage ?? 'none',
          labelFill: labelStyle?.webkitTextFillColor ?? '',
        }
      })
    `)

    assert.equal(controls.length, 2)
    for (const control of controls) {
      assert.match(control.className, /\bbtn--launch\b/)
      assert.equal(control.backgroundColor, 'rgb(255, 255, 255)')
      assert.ok(control.borderRadius < control.height / 2, JSON.stringify(control))
      assert.notEqual(control.boxShadow, 'none')
      assert.equal(control.hasAnimatedLabel, true)
      assert.match(control.labelBackground, /linear-gradient/)
      assert.equal(control.labelFill, 'rgba(0, 0, 0, 0)')
    }
  })

  test('стрелка карусели запускает фирменный блик при наведении', async () => {
    await useViewport(1440, 1200)

    const hasAnimatedLabel = await evaluate(
      `Boolean(document.querySelector('.review-carousel__nav--next .btn__label'))`,
    )
    assert.equal(hasAnimatedLabel, true)

    const root = await client.send('DOM.getDocument')
    const { nodeId } = await client.send('DOM.querySelector', {
      nodeId: root.root.nodeId,
      selector: '.review-carousel__nav--next',
    })
    await client.send('CSS.forcePseudoState', {
      nodeId,
      forcedPseudoClasses: ['hover'],
    })

    try {
      const animationName = await waitForValue(
        `getComputedStyle(document.querySelector('.review-carousel__nav--next .btn__label')).animationName`,
        (name) => name === 'btn-text-shine',
        'the carousel arrow shine animation to start',
      )
      assert.equal(animationName, 'btn-text-shine')
    } finally {
      await client.send('CSS.forcePseudoState', {
        nodeId,
        forcedPseudoClasses: [],
      })
    }
  })

  test('кнопка предыдущего отзыва зацикливает карусель', async () => {
    await useViewport(1440, 1200)

    const hasControl = await evaluate(
      `Boolean(document.querySelector('[aria-label="Предыдущий отзыв"]'))`,
    )
    assert.equal(hasControl, true)

    await evaluate(`document.querySelector('[aria-label="Предыдущий отзыв"]').click()`)
    const activeId = await waitForValue(
      `document.querySelector('.review-carousel__card[data-active="true"]')?.dataset.id`,
      (id) => id === 'lenta',
      'the previous testimonial to wrap around',
    )
    assert.equal(activeId, 'lenta')
  })

  test('стрелка вправо с клавиатуры переключает активный отзыв', async () => {
    await useViewport(1440, 1200)

    const focused = await evaluate(`
      (() => {
        const carousel = document.querySelector('.review-carousel')
        carousel.focus()
        return document.activeElement === carousel
      })()
    `)
    assert.equal(focused, true)

    await client.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'ArrowRight',
      code: 'ArrowRight',
      windowsVirtualKeyCode: 39,
      nativeVirtualKeyCode: 39,
    })
    await client.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'ArrowRight',
      code: 'ArrowRight',
      windowsVirtualKeyCode: 39,
      nativeVirtualKeyCode: 39,
    })

    const activeId = await waitForValue(
      `document.querySelector('.review-carousel__card[data-active="true"]')?.dataset.id`,
      (id) => id === 'cian',
      'the keyboard-selected testimonial to become active',
    )
    assert.equal(activeId, 'cian')
  })

  test('стрелка влево с клавиатуры возвращает предыдущий отзыв', async () => {
    await useViewport(1440, 1200)
    await evaluate(`document.querySelector('.review-carousel').focus()`)

    await client.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'ArrowLeft',
      code: 'ArrowLeft',
      windowsVirtualKeyCode: 37,
      nativeVirtualKeyCode: 37,
    })
    await client.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'ArrowLeft',
      code: 'ArrowLeft',
      windowsVirtualKeyCode: 37,
      nativeVirtualKeyCode: 37,
    })

    const activeId = await waitForValue(
      `document.querySelector('.review-carousel__card[data-active="true"]')?.dataset.id`,
      (id) => id === 'lenta',
      'the previous keyboard-selected testimonial to become active',
    )
    assert.equal(activeId, 'lenta')
  })

  test('свайп влево на мобильном открывает следующий отзыв', async () => {
    await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })

    try {
      await useViewport(390, 844)
      const stage = await evaluate(`
        (() => {
          const element = document.querySelector('.review-carousel__stage')
          document.documentElement.style.scrollBehavior = 'auto'
          element.scrollIntoView({ block: 'center' })
          const rect = element.getBoundingClientRect()
          return {
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2,
          }
        })()
      `)

      await client.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: stage.centerX + 72, y: stage.centerY }],
      })
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: stage.centerX - 72, y: stage.centerY }],
      })
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [],
      })

      const activeId = await waitForValue(
        `document.querySelector('.review-carousel__card[data-active="true"]')?.dataset.id`,
        (id) => id === 'cian',
        'the swiped testimonial to become active',
      )
      assert.equal(activeId, 'cian')
    } finally {
      await client.send('Emulation.setTouchEmulationEnabled', { enabled: false })
    }
  })

  test('карусель автоматически показывает следующий отзыв через пять секунд', async () => {
    await useViewport(1440, 1200)
    assert.equal(
      await evaluate(`document.querySelector('.review-carousel__card[data-active="true"]')?.dataset.id`),
      'ozon',
    )

    await pause(5_200)
    assert.equal(
      await evaluate(`document.querySelector('.review-carousel__card[data-active="true"]')?.dataset.id`),
      'cian',
    )
  })

  test('фокус на карусели приостанавливает автопрокрутку', async () => {
    await useViewport(1440, 1200)
    await evaluate(`document.querySelector('.review-carousel').focus()`)
    await pause(5_200)

    assert.equal(
      await evaluate(`document.querySelector('.review-carousel__card[data-active="true"]')?.dataset.id`),
      'ozon',
    )
  })

  test('наведение на карусель приостанавливает автопрокрутку', async () => {
    await useViewport(1440, 1200)
    const point = await evaluate(`
      (() => {
        const carousel = document.querySelector('.review-carousel')
        document.documentElement.style.scrollBehavior = 'auto'
        carousel.scrollIntoView({ block: 'center' })
        const rect = carousel.getBoundingClientRect()
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      })()
    `)
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: point.x,
      y: point.y,
    })
    await pause(5_200)

    assert.equal(
      await evaluate(`document.querySelector('.review-carousel__card[data-active="true"]')?.dataset.id`),
      'ozon',
    )
  })

  test('режим уменьшенного движения отключает анимацию и автопрокрутку отзывов', async () => {
    await client.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    })

    try {
      await useViewport(1440, 1200)
      const motion = await evaluate(`
        (() => {
          const card = document.querySelector('.review-carousel__card')
          const style = getComputedStyle(card)
          return {
            activeId: document.querySelector('.review-carousel__card[data-active="true"]')?.dataset.id,
            transitionDuration: style.transitionDuration,
          }
        })()
      `)
      assert.equal(motion.activeId, 'ozon')
      const transitionSeconds = motion.transitionDuration.split(',').map((duration) => {
        const value = Number.parseFloat(duration)
        return duration.trim().endsWith('ms') ? value / 1_000 : value
      })
      assert.ok(transitionSeconds.every((duration) => duration <= 0.000_001))

      await pause(5_200)
      assert.equal(
        await evaluate(`document.querySelector('.review-carousel__card[data-active="true"]')?.dataset.id`),
        'ozon',
      )
    } finally {
      await client.send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
      })
    }
  })

  test('фоновое свечение карусели меняется вместе с активным отзывом', async () => {
    await useViewport(1440, 1200)

    const initial = await evaluate(`
      (() => {
        const glow = document.querySelector('.review-carousel__glow.is-active')
        return {
          exists: Boolean(glow),
          background: glow ? getComputedStyle(glow).backgroundImage : 'none',
        }
      })()
    `)
    assert.equal(initial.exists, true)
    assert.notEqual(initial.background, 'none')

    await evaluate(`document.querySelector('[aria-label="Следующий отзыв"]').click()`)
    await waitForValue(
      `document.querySelector('.review-carousel__card[data-active="true"]')?.dataset.id`,
      (id) => id === 'cian',
      'the testimonial background to switch',
    )
    const nextBackground = await evaluate(
      `getComputedStyle(document.querySelector('.review-carousel__glow.is-active')).backgroundImage`,
    )
    assert.notEqual(nextBackground, initial.background)
  })

  test('вокруг карусели остаётся свободное свечение без цветной плашки', async () => {
    await useViewport(1440, 1200)
    const glow = await evaluate(`
      (() => {
        const field = getComputedStyle(document.querySelector('.review-carousel__glows'))
        const light = getComputedStyle(document.querySelector('.review-carousel__glow.is-active'))
        return {
          fieldBackground: field.backgroundColor,
          fieldOverflow: field.overflow,
          filter: light.filter,
        }
      })()
    `)

    assert.equal(glow.fieldBackground, 'rgba(0, 0, 0, 0)')
    assert.equal(glow.fieldOverflow, 'visible')
    assert.match(glow.filter, /blur\(/)
  })

  test('нажатие на боковую карточку делает её активным отзывом', async () => {
    await useViewport(1440, 1200)
    await evaluate(`document.querySelector('.review-carousel__card[data-position="1"]').click()`)

    const activeId = await waitForValue(
      `document.querySelector('.review-carousel__card[data-active="true"]')?.dataset.id`,
      (id) => id === 'cian',
      'the clicked side testimonial to become active',
    )
    assert.equal(activeId, 'cian')
  })

  test('карусель объявляет активный отзыв и скрывает боковые от скринридера', async () => {
    await useViewport(1440, 1200)
    const semantics = await evaluate(`
      (() => {
        const carousel = document.querySelector('.review-carousel')
        const cards = Array.from(document.querySelectorAll('.review-carousel__card'))
        return {
          role: carousel.getAttribute('role'),
          roledescription: carousel.getAttribute('aria-roledescription'),
          cards: cards.map((card) => ({
            active: card.dataset.active,
            hidden: card.getAttribute('aria-hidden'),
            role: card.getAttribute('role'),
            label: card.getAttribute('aria-label'),
          })),
        }
      })()
    `)

    assert.equal(semantics.role, 'region')
    assert.equal(semantics.roledescription, 'карусель')
    const active = semantics.cards.find((card) => card.active === 'true')
    assert.deepEqual(active, {
      active: 'true',
      hidden: 'false',
      role: 'group',
      label: 'Отзыв 1 из 3',
    })
    assert.ok(
      semantics.cards.filter((card) => card.active === 'false').every((card) => card.hidden === 'true'),
    )
  })

  test('текст боковых отзывов приглушён и не спорит с центральным', async () => {
    await useViewport(1440, 1200)
    const quoteOpacity = await evaluate(`
      (() => ({
        active: Number.parseFloat(getComputedStyle(
          document.querySelector('.review-carousel__card[data-active="true"] .review-carousel__quote'),
        ).opacity),
        sides: Array.from(document.querySelectorAll(
          '.review-carousel__card[data-active="false"] .review-carousel__quote',
        )).map((quote) => Number.parseFloat(getComputedStyle(quote).opacity)),
      }))()
    `)

    assert.equal(quoteOpacity.active, 1)
    assert.ok(quoteOpacity.sides.every((opacity) => opacity <= 0.3))
  })

  test('боковые карточки отзывов сильно прозрачны', async () => {
    await useViewport(1440, 1200)
    const opacity = await evaluate(`
      (() => ({
        active: Number.parseFloat(getComputedStyle(
          document.querySelector('.review-carousel__card[data-active="true"]'),
        ).opacity),
        sides: Array.from(document.querySelectorAll(
          '.review-carousel__card[data-active="false"]',
        )).map((card) => Number.parseFloat(getComputedStyle(card).opacity)),
      }))()
    `)

    assert.equal(opacity.active, 1)
    assert.ok(opacity.sides.every((value) => value <= 0.2))
  })

  test('карточки отзывов имеют вертикальный формат', async () => {
    for (const viewport of [
      { width: 1440, height: 1200 },
      { width: 390, height: 844 },
    ]) {
      await useViewport(viewport.width, viewport.height)
      const cards = await evaluate(`
        Array.from(document.querySelectorAll('.review-carousel__card')).map((card) => {
          const rect = card.getBoundingClientRect()
          return { id: card.dataset.id, width: rect.width, height: rect.height }
        })
      `)

      assert.equal(cards.length, 3)
      for (const card of cards) {
        assert.ok(
          card.height > card.width * 1.08,
          `viewport ${viewport.width}px: ${card.id} is ${card.width}x${card.height}`,
        )
      }
    }
  })

  test('на мобильном кнопки карусели не перекрывают текст отзыва', async () => {
    await useViewport(390, 844)
    const overlaps = await evaluate(`
      (() => {
        const quote = document.querySelector(
          '.review-carousel__card[data-active="true"] .review-carousel__quote',
        ).getBoundingClientRect()
        return Array.from(document.querySelectorAll('.review-carousel__nav')).map((button) => {
          const rect = button.getBoundingClientRect()
          return !(
            rect.right <= quote.left ||
            rect.left >= quote.right ||
            rect.bottom <= quote.top ||
            rect.top >= quote.bottom
          )
        })
      })()
    `)

    assert.deepEqual(overlaps, [false, false])
  })

  test('заголовок успешной отправки формы также выровнен слева', async () => {
    await useViewport(1440, 1200)

    await evaluate(`
      (() => {
        const setNativeValue = (element, value) => {
          const prototype = element instanceof HTMLSelectElement
            ? HTMLSelectElement.prototype
            : HTMLInputElement.prototype
          Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value)
          element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? 'change' : 'input', {
            bubbles: true,
          }))
        }

        setNativeValue(document.querySelector('#demo-name'), 'Анна')
        setNativeValue(document.querySelector('#demo-email'), 'anna@example.com')
        setNativeValue(document.querySelector('#demo-company'), 'Пример')
        setNativeValue(document.querySelector('#demo-goal'), 'Сайты и посадочные страницы')
        document.querySelector('#demo-consent').click()
        return true
      })()
    `)
    await pause(0)
    await evaluate(`document.querySelector('.demo__form').requestSubmit()`)

    await waitForValue(
      `Boolean(document.querySelector('.demo__success-title'))`,
      Boolean,
      'the demo success state to render',
    )
    const alignment = await evaluate(
      `getComputedStyle(document.querySelector('.demo__success-title')).textAlign`,
    )
    assert.ok(['left', 'start'].includes(alignment), `success title is ${alignment}`)
  })
})
