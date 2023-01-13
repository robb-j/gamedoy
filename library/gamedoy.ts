import { GamedoyActions } from './actions.js'
import { GamedoyDisplay } from './display.js'
import { Controls, GamedoyControls } from './controls.js'
import { CompositeDisposable, Disposable } from './disposables.js'
import { GamedoyDpad } from './dpad.js'
import { KeyboardSource } from './keyboard.js'
import { baseStyle, config, css, html, ShadowStyle } from './utils.js'

export interface Runtime<State = null, Result = void> {
  controls: Controls
  finish(result: Result): void
  state: State
  disposables: CompositeDisposable
  setDisplay(elem: Element | null): Disposable
}

export interface Scene<State, Params extends unknown[], Result> {
  setup(
    runtime: Runtime<null, Result>,
    ...params: Params
  ): State | Promise<State>

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
    grid-template: min(calc(100% - 150px - var(--frame)), var(--display)) auto / 1fr 1fr;
    grid-template-areas:
      'display display'
      'dpad    actions';
    gap: var(--gutter);
  }
  :host::part(display) {
    grid-area: display;
    justify-self: center;
    background: black;
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
  @media (min-width: ${config.ngageModeSize - 1}px) {
    :host {
      grid-template-columns: 1fr max-content 1fr;
      grid-template-rows: 100%;
      grid-template-areas: 'dpad display actions';
      align-items: center;
    }
  }
`)

export class Gamedoy extends HTMLElement {
  controls: GamedoyControls

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

  static setup(): void {
    if (!('customElements' in window)) {
      console.warn('customElements is not supported')
      return
    }
    customElements.define('gamedoy-console', Gamedoy)
    customElements.define('gamedoy-dpad', GamedoyDpad)
    customElements.define('gamedoy-actions', GamedoyActions)
    customElements.define('gamedoy-display', GamedoyDisplay)
    ShadowStyle.patch(document, [baseStyle])
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
  }

  async run<State = null, Params extends unknown[] = [], Result = void>(
    scene: Scene<State, Params, Result>,
    ...params: Params
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
        state: await scene.setup(initialRuntime, ...params),
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
