import { Disposable } from './disposables.js'

export type GameInput = 'A' | 'B' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
export interface GameInputListener {
  (): void
}

export interface Controls {
  onKeyDown(input: GameInput, handler: GameInputListener): Disposable
  onKeyUp(input: GameInput, handler: GameInputListener): Disposable
  state: Record<GameInput, boolean>
}

function blankState(): Record<GameInput, boolean> {
  return {
    A: false,
    B: false,
    UP: false,
    DOWN: false,
    LEFT: false,
    RIGHT: false,
  }
}

export function getInputFromPart(part: DOMTokenList): GameInput | null {
  if (part.contains('up')) return 'UP'
  if (part.contains('down')) return 'DOWN'
  if (part.contains('left')) return 'LEFT'
  if (part.contains('right')) return 'RIGHT'
  if (part.contains('a')) return 'A'
  if (part.contains('b')) return 'B'

  console.debug('#getInputFromPart did not find an input', part)
  return null
}

export interface GameInputSource {
  onInputDown?: (action: GameInput) => void
  onInputUp?: (action: GameInput) => void
}

export function vibrate(ms: number) {
  if (typeof navigator.vibrate !== 'function') return
  navigator.vibrate(ms)
}

export function bindInput(
  button: HTMLButtonElement,
  input: GameInput,
  self: GameInputSource
) {
  button.onpointerdown = (event) => {
    event.preventDefault()
    button.setPointerCapture(event.pointerId)
    self.onInputDown?.(input)

    vibrate(200)
  }
  button.onpointerup = (event) => {
    event.preventDefault()
    button.releasePointerCapture(event.pointerId)
    self.onInputUp?.(input)
  }
}

export class GamedoyControls implements Controls {
  state = blankState()
  listeners = {
    keyDown: new Map<GameInput, GameInputListener[]>(),
    keyUp: new Map<GameInput, GameInputListener[]>(),
  }

  constructor(public sources: GameInputSource[]) {
    for (const source of sources) {
      source.onInputDown = (a) => this.keyDown(a)
      source.onInputUp = (a) => this.keyUp(a)
    }
  }

  keyDown(input: GameInput) {
    if (this.state[input]) return // skip double clicks
    console.debug('Controls#keyDown %o', input)

    this.state[input] = true
    for (const l of this.listeners.keyDown.get(input) ?? []) l()
  }
  keyUp(input: GameInput) {
    console.debug('Controls#keyUp %o', input)

    this.state[input] = false
    for (const l of this.listeners.keyUp.get(input) ?? []) l()
  }

  /** Listen for a "down/started" `Action` */
  onKeyDown(action: GameInput, listener: GameInputListener): Disposable {
    this.listeners.keyDown.set(
      action,
      (this.listeners.keyDown.get(action) ?? []).concat(listener)
    )
    return {
      dispose: () => {
        const listeners = (this.listeners.keyDown.get(action) ?? [])?.filter(
          (l) => l !== listener
        )
        if (listeners.length > 0) this.listeners.keyDown.set(action, listeners)
        else this.listeners.keyDown.delete(action)
      },
    }
  }

  /** Listen for a "up/released" `Action` */
  onKeyUp(action: GameInput, listener: GameInputListener): Disposable {
    this.listeners.keyUp.set(
      action,
      (this.listeners.keyUp.get(action) ?? []).concat(listener)
    )
    return {
      dispose: () => {
        const listeners = (this.listeners.keyUp.get(action) ?? [])?.filter(
          (l) => l !== listener
        )
        if (listeners.length > 0) this.listeners.keyUp.set(action, listeners)
        else this.listeners.keyUp.delete(action)
      },
    }
  }

  /** Put the input state back and remove all listeners */
  reset() {
    this.state = blankState()

    // TODO: What should be cleaned up?

    // this.listeners.keyDown = new Map()
    // this.listeners.keyUp = new Map()
  }
}
