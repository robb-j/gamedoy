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
template.innerHTML = `
<style> :host > div > * { width: 100%; height: 100%; } </style>
<div part="frame"></div>
`

export class GamedoyDisplay extends HTMLElement {
  get frameElement() {
    return this.shadowRoot!.querySelector('div') as HTMLElement
  }

  constructor() {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.appendChild(template.content.cloneNode(true))
  }
}
