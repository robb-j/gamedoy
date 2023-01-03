import {
  bindInput,
  GameInput,
  GameInputSource,
  getInputFromPart,
} from './controls.js'

const template = document.createElement('template')
template.innerHTML = `
<button part="button a">A</button>
<button part="button b">B</button>
`

export class GamedoyActions extends HTMLElement implements GameInputSource {
  onInputDown?: (action: GameInput) => void
  onInputUp?: (action: GameInput) => void

  constructor() {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.appendChild(template.content.cloneNode(true))
    // this.appendChild(template.content.cloneNode(true))

    for (const elem of this.shadowRoot!.querySelectorAll<HTMLButtonElement>(
      'button'
    )) {
      const action = getInputFromPart(elem.part)
      if (action) bindInput(elem, action, this)
    }
  }
}
