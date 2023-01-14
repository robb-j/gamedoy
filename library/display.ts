import { Disposable } from './disposables.js'
import { baseStyle, config, css, html, ShadowStyle } from './utils.js'

export interface CanvasContext<T> {
  elem: HTMLCanvasElement
  width: number
  height: number
  ctx: T
}

export type CanvasContext2D = CanvasContext<CanvasRenderingContext2D>

export function create2dCanvas(
  width: number,
  height: number
): CanvasContext<CanvasRenderingContext2D> {
  const elem = document.createElement('canvas')
  const ctx = elem.getContext('2d')

  if (!(ctx instanceof CanvasRenderingContext2D)) {
    throw new TypeError('Cannot create a 2d rendering context')
  }
  elem.width = width * window.devicePixelRatio
  elem.height = height * window.devicePixelRatio

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  ctx.clearRect(0, 0, 400, 400)

  return { elem, width, height, ctx }
}

const template = document.createElement('template')
template.innerHTML = html` <slot></slot> `

const style = new ShadowStyle()
style.replaceSync(css`
  :host {
    padding: var(--frame);
    background-color: #000;
    border-radius: 6px;
    box-sizing: border-box;

    aspect-ratio: 1 / 1;
    max-width: min(var(--display), 100%);
    max-height: min(var(--display), calc(100vh - calc(3 * var(--frame))));

    display: flex;
    justify-content: stretch;
    align-items: stretch;
  }
  slot {
    position: relative;
    width: 100%;
    height: 100%;
    color: white;
    background-color: #555;
    overflow: hidden;

    /* make children fill the slot */
    display: flex;
    justify-content: stretch;
    align-items: stretch;
  }
  @media (max-width: ${config.ngageModeSize}px) {
    :host {
      max-height: 60vh;
    }
  }
`)

export class GamedoyDisplay extends HTMLElement {
  get slotElement() {
    return this.shadowRoot!.querySelector('slot') as HTMLSlotElement
  }

  constructor() {
    super()

    const root = this.attachShadow({ mode: 'open' })
    root.appendChild(template.content.cloneNode(true))
    ShadowStyle.patch(root, [baseStyle, style])
  }

  setCurrent(elem: Element | null): Disposable {
    console.debug('setDisplay', elem)

    if (elem && this.childElementCount > 0) {
      throw new Error('display is already set')
    }

    while (this.firstChild) this.removeChild(this.firstChild)

    if (
      elem &&
      !(elem instanceof HTMLCanvasElement) &&
      elem instanceof HTMLElement
    ) {
      elem.style.width = '400px'
      elem.style.height = '400px'
    }

    if (elem) this.append(elem)

    return { dispose: () => this.setCurrent(null) }
  }
}
