import { GamedoyActions } from './actions.js'
import { GamedoyDisplay } from './display.js'
import { Controls, GamedoyControls } from './controls.js'
import { CompositeDisposable, Disposable } from './disposables.js'
import { GamedoyDpad } from './dpad.js'
import { KeyboardSource } from './keyboard.js'
import { baseStyle, css, html, ShadowStyle } from './utils.js'

export interface Runtime<State = null, Result = void> {
  controls: Controls
  finish(result: Result): void
  state: State
  disposables: CompositeDisposable
  setDisplay(elem: Element | null): Disposable
}

export interface Scene<State, Params, Result> {
  setup(runtime: Runtime<null, Result>, params: Params): State | Promise<State>

  update?(runtime: Runtime<State, Result>, dt: number): void
  teardown?(runtime: Runtime<State, Result>): void | Promise<void>
}

const template = document.createElement('template')
template.innerHTML = html`
  <gamedoy-display part="display"></gamedoy-display>
  <gamedoy-dpad part="dpad"></gamedoy-dpad>
  <gamedoy-actions part="actions"></gamedoy-actions>
`

const style = new ShadowStyle()
style.replaceSync(css`
  :host {
    width: 100%;
    height: 100%;
    background-color: var(--gdy-theme);
    padding: var(--gutter);

    display: grid;
    grid-template: minmax(auto, var(--display)) 1fr / 1fr 1fr;
    grid-template-areas:
      'display display'
      'dpad    actions';
    gap: var(--gutter);
  }
  :host::part(display) {
    grid-area: display;
    justify-self: center;
  }
  :host::part(dpad) {
    grid-area: dpad;

    justify-self: flex-start;
    align-self: center;
  }
  :host::part(actions) {
    grid-area: actions;

    justify-self: flex-end;
    align-self: center;
  }
  /* Ngage mode */
  @media (orientation: landscape) {
    :host {
      grid-template-columns: 1fr minmax(auto, var(--display)) 1fr;
      grid-template-rows: 100%;
      grid-template-areas: 'dpad display actions';
      align-items: center;
    }
  }
`)

export interface GamedoyOptions {
  el?: string
}

export class Gamedoy extends HTMLElement {
  controls: GamedoyControls
  isReady: () => Promise<void>

  queryChild<T extends HTMLElement = HTMLElement>(selector: string) {
    const elem = this.shadowRoot?.querySelector<T>(selector)
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

  static setup(): void
  static setup<T extends { el: string }>(options: T): Gamedoy
  static setup(options: GamedoyOptions = {}): void | Gamedoy {
    if (!('customElements' in window)) {
      console.warn('customElements is not supported')
      return
    }
    customElements.define('gamedoy-console', Gamedoy)
    customElements.define('gamedoy-dpad', GamedoyDpad)
    customElements.define('gamedoy-actions', GamedoyActions)
    customElements.define('gamedoy-display', GamedoyDisplay)
    ShadowStyle.patch(document, [baseStyle])

    if (options?.el) {
      const elem = document.querySelector(options.el)
      if (!elem) {
        throw new TypeError('Gamedoy not found: ' + options.el)
      }
      if (!(elem instanceof Gamedoy)) {
        throw new TypeError('Not a Gamedoy: ' + options.el)
      }
      return elem
    }
    return undefined
  }

  constructor() {
    super()

    const root = this.attachShadow({ mode: 'open' })
    root.appendChild(template.content.cloneNode(true))
    ShadowStyle.patch(root, [baseStyle, style])

    this.controls = new GamedoyControls([
      this.dpad,
      this.actions,
      new KeyboardSource(),
    ])

    // Tick so that the inline Pixeboy font has loaded
    const ready = new Promise<void>((resolve) => setTimeout(() => resolve(), 1))
    this.isReady = () => ready
  }

  // There has to be a better way...
  async run(scene: Scene<null, undefined, void>): Promise<void>
  async run<S>(scene: Scene<S, undefined, void>): Promise<void>
  async run<R>(scene: Scene<null, undefined, R>): Promise<R>
  async run<P>(scene: Scene<null, P, void>, params: P): Promise<void>
  async run<S, P>(scene: Scene<S, P, void>, params: P): Promise<void>
  async run<S, R>(scene: Scene<S, undefined, R>): Promise<R>
  async run<P, R>(scene: Scene<null, P, R>): Promise<R>
  async run<S, P, R>(scene: Scene<S, P, R>, params: P): Promise<R>

  async run<State, Params extends any[], Result>(
    scene: Scene<State, Params, Result>,
    params?: Params
  ): Promise<Result> {
    const ac = new AbortController()

    const result = await new Promise<Result>(async (resolve) => {
      const initialRuntime = this.createRuntime((r: Result) => resolve(r))

      ac.signal.addEventListener('abort', () => {
        initialRuntime.disposables.dispose()
        this.controls.reset()
      })

      const runtime = {
        ...initialRuntime,
        state: await scene.setup(initialRuntime, params ?? ({} as any)),
      }

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
    return {
      controls: this.controls,
      disposables: new CompositeDisposable(),
      setDisplay: (elem) => this.display.setCurrent(elem),
      finish,
      state: null,
    }
  }
}
