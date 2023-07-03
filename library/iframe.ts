import { GameInput, GameInputSource, GamedoyControls } from './controls.js'
import { CompositeDisposable, Disposable } from './disposables.js'
import { Runtime, Scene } from './gamedoy.js'

const ALL_KEYS: GameInput[] = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'A', 'B']

export function iframeScene<R = void>(
  url: string,
  options: IframeOptions
): Scene<null, undefined, R> {
  const setup = (r: Runtime<null, R>) => {
    r.disposables.add(createIframe(url, r, options))
    return null
  }

  return { setup }
}

export interface IframeOptions {
  width: number
  height: number
  allow?: string
  allowFullscreen?: boolean
}

export interface IframeContext {
  elem: HTMLIFrameElement
  dispose(): void
}

export function createIframe<R = void>(
  url: string,
  runtime: Runtime<null, R>,
  options: IframeOptions
): IframeContext {
  // Create the iframe element
  const elem = document.createElement('iframe')
  elem.width = options.width.toString()
  elem.height = options.height.toString()
  elem.src = url
  elem.dataset.gamedoy = 'v1'
  elem.setAttribute('frameborder', '0')
  if (options.allow) elem.allow = options.allow
  if (options.allowFullscreen) elem.allowFullscreen = elem.allowFullscreen

  // Keep track of disposables
  const disposable = new CompositeDisposable()

  // Set the iframe as a display
  disposable.add(runtime.setDisplay(elem))

  // Hook up the iframe once it has loaded
  elem.onload = () => {
    if (!elem.contentWindow) return

    // Create a bus to talk via postMessage/"message"
    const bus = ibus(elem.contentWindow)

    // Send each key up/down event
    for (const key of ALL_KEYS) {
      disposable.add(
        runtime.controls.onKeyDown(key, () => {
          bus.emit('onKeyDown', { key })
        }),
        runtime.controls.onKeyUp(key, () => {
          bus.emit('onKeyUp', { key })
        })
      )

      // Listen for "finish" events
      bus.addEventListener('finish', (result) => runtime.finish(result))
    }
  }

  // TODO: send a "teardown" and wait for a response?

  const dispose = () => disposable.dispose()

  return { elem, dispose }
}

// stolen from:
// https://github.com/digitalinteraction/portals/blob/main/src/lib/event-emitter.ts
//

export type EventListener<T extends any[] = any> = (...args: T) => void

interface EventEmitter {
  emit(name: string, ...args: unknown[]): void
  addEventListener(name: string, listener: EventListener): void
  removeEventListener(name: string, listener: EventListener): void
}

/** @unstable create an event bus for the window to talk via postMessage */
export function ibus(window: Window): EventEmitter {
  const listeners = new Map<string, EventListener[]>()

  window.addEventListener('message', (event) => {
    try {
      const { type, payload } = JSON.parse(event.data)
      listeners.get(type)?.forEach((l) => l(payload))
    } catch (error) {
      console.error("Invalid iframe 'message' payload")
    }
  })

  function emit(type: string, payload: unknown) {
    window.postMessage(JSON.stringify({ type, payload }))
  }
  function addEventListener(name: string, listener: EventListener) {
    listeners.set(name, [...(listeners.get(name) ?? []), listener])
  }
  function removeEventListener(name: string, listener: EventListener) {
    listeners.set(
      name,
      listeners.get(name)?.filter((l) => l !== listener) ?? []
    )
  }

  return { emit, addEventListener, removeEventListener }
}

/** @unstable Wrap ibus messages to emulate touch controls from within the iframe */
class IframeGameInput implements GameInputSource {
  onInputDown?: (action: GameInput) => void
  onInputUp?: (action: GameInput) => void

  constructor(bus: EventEmitter) {
    bus.addEventListener('onKeyDown', (payload) =>
      this.onInputDown?.(payload.key)
    )
    bus.addEventListener('onKeyUp', (payload) => this.onInputUp?.(payload.key))
  }
}

/** @unstable Creates a runtime for use in iframes */
export function iruntime(window: Window, state = null): Runtime {
  const bus = ibus(window)

  const disposables = new CompositeDisposable()
  const controls = new GamedoyControls([new IframeGameInput(bus)])
  function finish(payload: unknown) {
    disposables.dispose()
    bus.emit('finish', payload)
  }
  function setDisplay(): Disposable {
    throw new Error('setDisplay unavailable in iframes')
  }

  return { controls, disposables, finish, state, setDisplay }
}
