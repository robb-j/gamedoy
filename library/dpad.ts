import {
  bindInput,
  GameInput,
  GameInputSource,
  getInputFromPart,
  vibrate,
} from './controls.js'
import { baseStyle, css, html } from './utils.js'

const template = document.createElement('template')
template.innerHTML = html`
  <button part="button up">▲</button>
  <button part="button left">◀</button>
  <button part="button down">▼</button>
  <button part="button right">▶</button>
  <div part="center"></div>
`

const style = new CSSStyleSheet()
style.replaceSync(css`
  :host {
    display: grid;
    grid-template: repeat(3, 50px) / repeat(3, 50px);
    grid-template-areas:
      '.    up    .    '
      'left center right'
      '.    down      .';
    touch-action: none;
  }
  :host::part(button) {
  }
  :host::part(up) {
    grid-area: up;
    border-bottom-width: 0;
    border-top-left-radius: var(--gdy-s);
    border-top-right-radius: var(--gdy-s);
  }
  :host::part(left) {
    grid-area: left;
    border-right-width: 0;
    border-top-left-radius: var(--gdy-s);
    border-bottom-left-radius: var(--gdy-s);
  }
  :host::part(down) {
    grid-area: down;
    border-top-width: 0;
    border-bottom-left-radius: var(--gdy-s);
    border-bottom-right-radius: var(--gdy-s);
  }
  :host::part(right) {
    grid-area: right;
    border-left-width: 0;
    border-top-right-radius: var(--gdy-s);
    border-bottom-right-radius: var(--gdy-s);
  }
  :host::part(center) {
    background-color: rgba(255, 255, 255, 0.4);
    grid-area: center;

    pointer-events: none;
  }
`)

export class GamedoyDpad extends HTMLElement implements GameInputSource {
  onInputDown?: (action: GameInput) => void
  onInputUp?: (action: GameInput) => void

  constructor() {
    super()

    const root = this.attachShadow({ mode: 'open' })
    root.appendChild(template.content.cloneNode(true))
    root.adoptedStyleSheets = [baseStyle, style]

    for (const elem of this.shadowRoot!.querySelectorAll<HTMLButtonElement>(
      'button'
    )) {
      const action = getInputFromPart(elem.part)
      if (action) bindInput(elem, action, this)
    }

    let dpadAction: GameInput | null = null

    this.onpointerdown = (e) => {
      if (e.target !== this) return
      dpadAction = this.getDpadAction(this, e)
      if (!dpadAction) return

      e.preventDefault()
      this.setPointerCapture(e.pointerId)
      this.onInputDown?.(dpadAction)

      vibrate(100)
    }
    this.onpointerup = (e) => {
      if (!dpadAction) return

      e.preventDefault()
      this.releasePointerCapture(e.pointerId)
      this.onInputUp?.(dpadAction)
      dpadAction = null
    }
  }

  getDpadAction(dpad: HTMLElement, e: PointerEvent): GameInput | null {
    let theta = Math.atan2(
      e.offsetY - dpad.clientHeight * 0.5,
      e.offsetX - dpad.clientWidth * 0.5
    )
    if (theta < 0) theta += Math.PI * 2

    theta *= 180 / Math.PI

    // TODO: skip the degrees conversion
    // TR —> 315 -> 1.75 pi
    // BR -> 45  -> 0.25 pi
    // BL -> 135 -> 0.75 pi
    // TL -> 225 -> 1.25 pi

    if (theta > 315 || theta < 45) return 'RIGHT'
    if (theta > 45 && theta < 135) return 'DOWN'
    if (theta > 135 && theta < 225) return 'LEFT'
    if (theta > 225 && theta < 315) return 'UP'

    return null
  }
}
