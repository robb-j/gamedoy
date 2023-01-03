import { GameInput, GameInputSource } from './controls.js'

const DEFAULT_KEYBOARD_MAPPING: Map<string, GameInput> = new Map([
  ['KeyW', 'UP'],
  ['KeyA', 'LEFT'],
  ['KeyS', 'DOWN'],
  ['KeyD', 'RIGHT'],
  ['KeyJ', 'A'],
  ['KeyK', 'B'],
  ['ArrowUp', 'UP'],
  ['ArrowLeft', 'LEFT'],
  ['ArrowRight', 'RIGHT'],
  ['ArrowDown', 'DOWN'],
  ['KeyX', 'A'],
  ['KeyZ', 'B'],
])

export interface KeyboardSourceOptions {
  global?: GlobalEventHandlers
  mapping?: Map<string, GameInput>
}

export class KeyboardSource implements GameInputSource {
  onInputDown?: (action: GameInput) => void
  onInputUp?: (action: GameInput) => void

  constructor({
    global = window,
    mapping = DEFAULT_KEYBOARD_MAPPING,
  }: KeyboardSourceOptions = {}) {
    global.onkeydown = (event: KeyboardEvent) => {
      const action = mapping.get(event.code)
      console.debug('window@onkeydown code=%o action=%o', event.code, action)
      if (action) this.onInputDown?.(action)
    }
    global.onkeyup = (event: KeyboardEvent) => {
      const action = mapping.get(event.code)
      console.debug('window@onkeydown code=%o action=%o', event.code, action)
      if (action) this.onInputUp?.(action)
    }
  }
}
