---
layout: html.njk
title: Game dev
---

# Game development

This page contains information about making games for Gamedoy.

## Anatomy of a game

A game is a JavaScript file that exports hooks and artwork which the app uses to start, stop and update the game.

```ts
import { Runtime } from '@robb_j/gamedoy'

interface State {
  score: number
}

export function setup(runtime: Runtime) {
  return { score: 5 } satisfies State
}

export function update(runtime: Runtime<State>, dt: number) {
  // (optional) Game loop here
}

export function teardown(runtime: Runtime<State>) {
  // (optional) Clean up here
}
```

### setup

The first hook, `setup`, is called to start your game. It should do whatever is needed to get the game going and is responsible for creating the initial game State.

You can put whatever you want in your _State_ and it will be passed to the other hooks for easy access. For instance, you can use it to keep track of the score or certain images that have been loaded in.

`setup` can be asynchronous by returning a promise or using an `async` function, the promise will be awaited before any of the other hooks will be called. You can even [finish](#finish) the game within that promise if you have no need of the `update` hook.

This is a great time to register control handlers and setup the display of your game, all of which can be done through the [runtime](#runtime) object which is passed to this hook.

### update

The update hook is **optional**. If defined, it will be called every frame (using [Window.requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) under the hood) until the game is finished. It is not called at all if the game is finished before `setup` is over. This is great place for calculating scoring, updating the _State_, rendering to a canvas or processing game logic.

You get the [runtime](#runtime) object, which now has your _State_ set on it. This makes it easy to access your _State_ and and interact with the runtime.

You also get the `dt` parameter which is the number of **seconds** since the last update was called. This is useful for creating frame-rate-independent interactions.

> Not every device will have the same frame-rate, so instead of applying constant changes each update, times any constant change by the `dt` to make the movement frame-rate-independent. This way the amount moved between ticks is proportional to the time elapsed so fast and slow devices all have the same experience.

The update hook must be synchronous, so any promises returned here will be ignored. It is not advised.

### teardown

Once the game has finished, this **optional** hook is called. Use it to clean up anything you've done since the game was set up. If you've used the [Runtime#disposables](#disposables) you don't need to clean those things up. Wherever you can use disposables, it makes everything simpler.

---

## Runtime

The Runtime is how to interact with the console itself. It has useful methods for game related things.

```ts
export interface Runtime<State, Result> {
  controls: Controls
  finish(result: Result)
  state: State
  disposables: CompositeDisposable
  setDisplay(elem: HTMLElement | null): Disposable
}
```

Fields on the Runtime class lend themselves to JavaScript destructuring, such as:

```ts
export function setup({ controls, disposables, setDisplay }: Runtime) {
  // ...
}
```

### controls

You'll want players to be able to interact with your game. The app provides a minimal D-pad and A/B buttons, use `controls` to register handlers for when these buttons are pressed, or query any buttons current state.

```ts
interface State {}

export function update({ controls }: Runtime<State>, dt: number) {
  // See whether the A button is currently being pressed or not, returns a boolean
  controls.state.A // boolean
}
```

There is also `onKeyUp` and `onKeyDown` to listen for when a button is pressed or released. They return a `Disposable` which you can use to remove the handler. This works nicely with [Runtime#disposables](#disposables) so you don't have to unregister them in `teardown`. You can also use the `Disposable` to manually remove the handler if you need dynamic controls in your game.

```ts
interface State {}

export function setup({ controls, disposables }: Runtime) {
  const state: State = {}

  disposables.add(
    controls.onKeyDown('UP', () => jump(state)),
    controls.onKeyUp('LEFT', () => slide(state))
  )

  return state
}

function jump(state: State) {
  /* ... */
}
function slide(state: State) {
  /* ... */
}
```

### finish

Every game has to end and this method triggers that. Use this to tell the app your game is over and to start the `teardown` process. If you want your game to animate out, you should do that before you call `finish`. You pass the _Result_ of your game to this method, if you are using that feature.

```ts
interface State {}
interface Result {
  score: number
}

export function update({ state, finish }: Runtime<State, Result>) {
  if (state.health < 0) {
    finish({ score: 42 })
  }
}
```

### state

Your game probably needs to remember things, like how the player is doing or what the current goal is. That's what the State is for. As mentioned in [setup](#setup), `state` is added to the runtime for easy access and modification.

### disposables

You should tidy up after yourself, `disposables` helps you do that. Methods like [controls#onKeyUp](#controls) or [setDisplay](#setdisplay) return a `Disposable` which has a method that undoes whatever action you did. You can manually call `.dispose()` on that object or you can pass it to `disposables` to do it for you when the game is finished.

```ts
export function setup({ disposables, setDisplay, controls }: Runtime) {
  disposables.add(
    setDisplay(canvas),
    controls.onKeyUp('UP', () => /* ... */)
  )
}
```

A disposable is actually just one of these, so you can call `dispose` yourself on them or create your own if you like.

```ts
interface Disposable {
  dispose(): void
}
```

### setDisplay

Your game needs to look nice. So you need to give the app something to put on the display. Call `setDisplay` to put an [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) in the app's screen for your players to see. What your game looks like is up to you so you can put whatever you like in there. The style of the screen makes it so the display is always square and up-to 400x400 pixels.

This returns a `Disposable`, which makes it easy to remove the display afterwards using [disposables](#disposables).

If you want to use a HTMLCanvas, see [create2dCanvas](#create2dCanvas) in the Game Library section.

---

## Game library

There are a set of tools and types you can use to help write your games. Everything should be imported from the `mod.js` file.

> Yes its weird you have to import a TypeScript file with .js. It's complicated.

### TypeScript

You can import the `Runtime` object from the game library which goes most of the way to writing a game in TypeScript. This helps with autocompletion and code linting. For example:

```ts
import { Runtime } from '@robb_j/gamedoy/mod.js'

interface State {
  score: number
  lives: number
}

export function setup(runtime: Runtime): State {
  return { score: 0 }
}
export function update(runtime: Runtime<State>, dt: number) {}
export function teardown({ state }: Runtime<State>) {
  return { score: state.score }
}
```

### create2dCanvas

If you want to draw things, a HTMLCanvas is what you might want, and there is a helper to create one of those for you, `create2dCanvas`. Import it from the game lib, and call it to create a `CanvasContext2D`. It is an object that wraps the canvas `elem`, the `width` and `height` and a drawing `ctx` that you can use to render things. This works nicely when stored in your [state](#state).

> It does a little magic to make the canvas look crisper by looking at window.[devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) and multiplying the actual size up but you only ever have to work with the width/height you pass to this method.

```ts
import {
  Runtime,
  create2dCanvas,
  CanvasContext2D,
} from '@robb_j/gamedoy/mod.js'

interface State {
  canvas: CanvasContext2D
}

export function setup({ setDisplay, disposables }: Runtime) {
  const canvas = create2dCanvas('2d', 400, 400)
  disposables.add(setDisplay(canvas.elem))
  return { canvas } satisfies State
}
export function update({ state }: Runtime<State>, dt: number) {
  const { ctx, width, height } = state.canvas

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = 'coral'
  ctx.fillRect(150, 150, 350, 350)
}
```

[More about 2d canvas rendering](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D).

> If there is interest in the future, there could be different canvas contexts like `3d` or `webgl`.

### animate

If you want to animate something between two values over a set duration, this is your function. Call `animate` with the duration of your animation and a function to call at each step of the animation. The function is called with `factor` which is a number between 0 and 1 that represents how far through the animation it is, useful for multiplying.

```ts
import { animate } from '@robb_j/gamedoy/mod.js'

await animate(3_000, (factor) => {
  // ...
})
```

### animate2dCanvas

> **Unstable**

For if you want to animate between values and draw to a canvas.

```ts
import { animate2dCanvas } from '@robb_j/gamedoy/mod.js'

await animate2dCanvas(canvas, 3_000, (factor) => {
  // ...
})
```

> The [boot](https://github.com/robb-j/gamedoy/blob/main/library/boot.ts) uses this quite a bit if you'd like inspiration. It uses animate under the hood and adds a bit to clear previous rendering and manage the `ctx`.

## Iframes

To separate concerns, you can develop your game as an iframe instead of as embedded JavaScript. Gamedoy provides these utilities to help with that.

You can create a [iframeScene](#iframeScene) to launch your iframe right in the normal Gamedoy screen, then you can use [ibus](#ibus) or [iruntime](#iruntime) within that iframe to easily interact with the scene. If you want to do things manually, [createIframe](#createIframe) details the communication between iframes & Gamedoy.

### iframeScene

Creates a scene that shows a webpage on the screen. You can optionally pass `allow` to the options grant extra permissions, it's the same as the attribute on an `<iframe>` element.

```ts
import { iframeScene } from '@robb_j/gamedoy/mod.js'

const scene = iframeScene('https://example.com/', {
  width: 400,
  height: 400,
})
```

> [Run an iframe →]({{ '/run-games/#iframes' | url }})

### createIframe

`createIframe` is used under-the-hood by `iframeScene` to create the `<iframe>` element, and bind it to the `Runtime` object by posting and receiving events from the frame. It returns a [Disposable](#disposables) to remove the iframe from Gamedoy.

```ts
import { createIframe } from '@robb_j/gamedoy/mod.js'

const iframe = createIframe('https://example.com', runtime, {
  width: 400,
  height: 400,
})
```

The messages between the scene and iframe are transmitted through an [ibus](#ibus), the scene sends these events to the iframe:

- `onKeyUp` is the same as the method on [controls](#controls), the payload is an object with `key` of the action being pressed.
- `onKeyDown` is also the same as on [controls](#controls), the payload is the same as `onKeyUp`.

In return the scene listens for these events to be sent from the iframe:

- `finish` tells the scene that the iframe has run to completion and the game is over, it should send an object with `score` as a number. Its the same as [finish](#finish) on the runtime.

The iframe element has `data-gamedoy="v1"` set on it so that you can detect that your page is being run by Gamedoy.

```ts
// Inside your iframe
const version = window.frameElement?.dataset.gamedoy
```

### ibus

`ibus` creates an an event bus to communicate between with iframe using `postMessage`. It adds a layer on top of `postMessage` & `addEventListener` to allow different types of messages to be transmitted. The bus has these methods on it:

- `emit` to send a message to the window
- `addEventListener` to listen for an event from the window
- `removeEventListener` to stop listening to an event from the window

```ts
import { ibus } from '@robb_j/gamedoy/mod.js'

const bus = ibus(window)

// Listen for key presses from the window
bus.addEventListener('onKeyDown', (payload) => {
  console.log('key down', payload.key)
})

// At some point later, tell the scene the game is over
bus.emit('finish', { score: 7 })
```

### iruntime

`iruntime` is a helper to create a [runtime](#runtime) from within an iframe. It works by using an `ibus` to emulate the runtime API.

```ts
import { iruntime } from '@robb_j/gamedoy'

const runtime = iruntime(window)

// Increment the score when they press A
runtime.controls.onKeyDown('A', () => {
  score++
})

// Finish the game when they press B
runtime.controls.onKeyUp('B', () => {
  runtime.finish({ score })
})
```

<!--
### css

If your game is HTML based and you'd like some style, `css` is here to help. It is a [template literal tag function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), which means you can call it with a multi-line string. It just returns the CSS string, but is useful for IDE syntax highlighting

```ts
import { css } from '@robb_j/gamedoy/mod.js'

const getStyle = css`
  p {
    color: red;
  }
`

export function setup({}: Runtime) {
  const div = document.createElement('div')
  div.appendChild(getStyle())
  setDisplay(div)
  return {}
}
```

> Some IDEs will automatically syntax-highlight the nested CSS, which is the reason this is called simply `css`. -->

---

Next:

- [Run games →]({{ '/run-games' | url }})
