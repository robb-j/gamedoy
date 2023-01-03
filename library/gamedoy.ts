import { GamedoyActions } from './actions.js'
import { GamedoyDisplay } from './display.js'
import { Controls, GamedoyControls } from './controls.js'
import { CompositeDisposable, Disposable } from './disposables.js'
import { GamedoyDpad } from './dpad.js'
import { KeyboardSource } from './keyboard.js'

export interface Runtime<State = null, Result = undefined> {
  controls: Controls
  finish(result?: Result): void
  state: State
  disposables: CompositeDisposable
  setDisplay(elem: HTMLElement | null): Disposable
}

export interface Scene<Params = any, State = any, Result = any> {
  setup(runtime: Runtime<null, Result>, params: Params): State | Promise<State>
  update?(runtime: Runtime<State, Result>, dt: number): void
  teardown?(runtime: Runtime<State, Result>): Result | Promise<Result>
}

const template = document.createElement('template')
template.innerHTML = `
<gamedoy-display></gamedoy-display>
<gamedoy-dpad></gamedoy-dpad>
<gamedoy-actions></gamedoy-actions>
`

export class Gamedoy extends HTMLElement {
  controls: GamedoyControls

  queryChild<T extends HTMLElement = HTMLElement>(selector: string) {
    const elem = this.querySelector<T>(selector)
    if (!elem) throw new TypeError(`'${selector}' not found`)
    return elem
  }

  // From the template
  get display() {
    return this.queryChild<GamedoyDisplay>('gamedoy-display')
  }
  get dpad() {
    return this.queryChild<GamedoyDpad>('gamedoy-dpad')
  }
  get actions() {
    return this.queryChild<GamedoyActions>('gamedoy-actions')
  }

  static setup(): void {
    if (!('customElements' in window)) {
      console.warn('customElements is not supported')
      return
    }
    customElements.define('gamedoy-console', Gamedoy)
    customElements.define('gamedoy-dpad', GamedoyDpad)
    customElements.define('gamedoy-actions', GamedoyActions)
    customElements.define('gamedoy-display', GamedoyDisplay)
  }

  constructor() {
    super()

    // TODO: you can't style nested custom elements so this doesn't use `shadowRoot`
    // this.attachShadow({ mode: 'open' })
    // this.shadowRoot!.appendChild(template.content.cloneNode(true))
    this.appendChild(template.content.cloneNode(true))

    this.controls = new GamedoyControls([
      this.dpad,
      this.actions,
      new KeyboardSource(),
    ])
  }

  async runScene<Params, State, Result>(
    scene: Scene<Params, State, Result>,
    params: Params
  ): Promise<Result> {
    const ac = new AbortController()

    const result = await new Promise<Result>(async (resolve) => {
      const initialRuntime = this.createRuntime<Result>(resolve)

      ac.signal.addEventListener('abort', () => {
        initialRuntime.disposables.dispose()
        this.controls.reset()
      })

      const runtime = {
        ...initialRuntime,
        state: await scene.setup(initialRuntime, params),
      }
      // runtime.state = await scene.setup(runtime, params)

      ac.signal.addEventListener('abort', () => {
        if (scene.teardown) scene.teardown(runtime)
      })

      if (scene.update && !ac.signal.aborted) {
        let lastTick = Date.now()

        function tick() {
          if (ac.signal.aborted || !scene.update) return
          scene.update(runtime, (Date.now() - lastTick) / 1000)
          lastTick = Date.now()
          timerId = window.requestAnimationFrame(tick)
        }
        let timerId = window.requestAnimationFrame(tick)

        ac.signal.addEventListener('abort', () =>
          window.cancelAnimationFrame(timerId)
        )
      }
    })

    ac.abort()

    return result
  }

  createRuntime<R>(finish: (r: R) => void): Runtime<null, R> {
    const frame = this.display.frameElement

    function setDisplay(elem: HTMLElement | null) {
      console.debug('setDisplay', elem)
      if (elem && frame.childElementCount > 0) {
        throw new Error('display is already set')
      }
      while (frame.firstChild) frame.removeChild(frame.firstChild)
      if (elem) frame.appendChild(elem)
      return { dispose: () => setDisplay(null) }
    }

    return {
      controls: this.controls,
      disposables: new CompositeDisposable(),
      setDisplay,
      finish,
      state: null,
    }
  }
}
