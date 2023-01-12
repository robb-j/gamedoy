import {
  bindInput,
  GameInput,
  GameInputSource,
  getInputFromPart,
} from './controls.js'
import { baseStyle, config, css } from './utils.js'

const template = document.createElement('template')
template.innerHTML = `
<button part="button a">A</button>
<button part="button b">B</button>
`

const style = new CSSStyleSheet()
style.replaceSync(css`
  :host {
    display: flex;
    gap: 1em;
    justify-content: center;
    touch-action: none;
  }
  :host::part(button) {
    line-height: 1rem;
    font-size: 2rem;
    border-radius: 100%;
    width: 65px;
    height: 65px;
    filter: drop-shadow(-1px 2px 3px rgba(0, 0, 0, 0.1));
  }
  @media (min-width: ${config.miniModeSize}px) {
    :host::part(a) {
      position: relative;
      top: 0.5em;
    }
    :host::part(b) {
      position: relative;
      top: -0.5em;
    }
  }
  @media (max-width: ${config.miniModeSize - 1}px) {
    :host {
      flex-direction: column-reverse;
    }
    :host::part(button) {
      position: unset;
    }
  }
`)

export class GamedoyActions extends HTMLElement implements GameInputSource {
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
  }
}
