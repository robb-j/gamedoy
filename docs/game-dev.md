---
layout: html.njk
title: Docs
---

# Game development

This page contains information about making games for Gamedoy.

Games are located in the `games` folder at the top of the project. They should be in their own folder like `games/snake`.

Games are a JavaScript file which export a `Scene` to be run by Gamedoy.

## Anatomy of a game

A game is a JavaScript file that exports hooks and artwork which the app uses to start, stop and update the game.

```ts
interface Game<State> {
  setup(runtime: Runtime): Promise<State>
  update?(runtime: Runtime<State>, dt: number): void
  teardown?(runtime: Runtime<State>): Promise<void>
}
```

### setup

The first hook, `setup`, is called to start the game. It does whatever is needed to get the game going and is responsible for creating the initial game State.

You can put whatever you want in your State and it will be passed to the other hooks for easy access. For instance, keeping track of the score or certain images that have been loaded in.

`setup` can be asynchronous by returning a promise or using an `async` function, the promise will be awaited before any of the other hooks will be called. You can even [finish](#finish) the game within that promise if you have no need of the `update` hook.

This is a great time to register control handlers and setup the display of your game, all of which can be done through the [runtime](#runtime) object which is passed to this hook.

### update

The update hook is optional. If defined, it will be called every frame (using [Window.requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) under the hood) until the game is finished. This is great place for calculating scoring, updating the State, rendering to a canvas or processing game logic.

You get the [runtime](#runtime) object, which now has your State set on it. This makes it easy to access your State and and interact with the runtime.

You also get the `dt` parameter which is the number of seconds since the last update was called. This is useful for creating frame-rate-independent interactions. Not every device will have the same frame-rate, so instead of applying constant changes each update, times any constant change by the `dt` to make the movement frame-rate-independent. This way the amount moved between ticks is proportional to the time elapsed so fast and slow devices all have the same experience.

The update hook must be synchronous, so any promise returned will be ignored so it is not advised.

### teardown

Once the game has finished, this hook is called. Use it to clean up anything you've done since the game was set up. If you've used the [Runtime#disposables](#disposables) you don't need to clean those things up.

`teardown` is responsible for returning the score the player achieved. It should return an object like `{ score: 1233 }`. The score needs to be an integer and can be no larger than 65535.

> This may change in the future, you might be able to pass the score to straight to [Runtime#finish](#finish) instead.

### assets

The app shows two pieces of artwork about the game outside of the regular game loop.

**artwork** is shown after the splash screen to let players know your game is about to be played, it should be **400x400** pixels and can contain whatever you want. You might want to sign it so players know its your game.

**icon** is shown during the score and leaderboard screens to relate the score back to the game that was played. It should be **64x64** pixels. Its rendered on a dark background.

To help with getting assets into the app, you can use [parcel's data-url](https://parceljs.org/features/bundle-inlining/#inlining-as-a-data-url) imports to quickly expose the assets for the app to pick up.

```ts
// Export icon.png and artwork.png which are located next to the game script
export { default as icon } from 'data-url:./snake/icon.png'
export { default as artwork } from 'data-url:./snake/artwork.png'
```

If you want to be fancy, you can dynamically pick an asset by exposing a function instead:

```ts
// Load a couple of assets
import iconData from 'data-url:./icon.png'
import morningArtwork from 'data-url:./artwork-a.png'
import afternoonArtwork from 'data-url:./artwork-b.png'
import eveningArtwork from 'data-url:./artwork-c.png'

// Dynamically pick an artwork based on the time in the day
export function icon() {
  return iconData
}
export function artwork() {
  const hour = new Date().getHours()
  if (hour < 12) return morningArtwork
  if (hour < 18) return afternoonArtwork
  return eveningArtwork
}
```

---

## Runtime

The Runtime is how to interact with the console itself. It has useful methods for game related things.

```ts
export interface Runtime<State> {
  controls: Controls
  finish(): void
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

You'll want players to be able to interact with your game.
The app provides a minimal D-pad and A/B buttons, use `controls`
to register handlers for when these buttons are pressed, or query any buttons current state.

```ts
export function setup({ controls }: Runtime) {
  // See whether the A button is currently being pressed or not, returns a boolean
  controls.state.A
}
```

There is also `onKeyUp` and `onKeyDown` to listen for when the a button is pressed or released. They return a `Disposable` which you can use to remove the handler. This works nicely with [Runtime#disposables](#disposables) so you don't have to unregister them in `teardown`. You can also use the `Disposable` to manually remove the handler if you need dynamic controls in your game.

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

Every game has to end and this method triggers that. Use this to tell the app your game is over and to start the `teardown` process. If you want your game to animate out, you should do that before you call `finish`.

```ts
export function update({ state, finish }: Runtime) {
  if (state.health < 0) {
    finish()
  }
}
```

### state

Your game needs to remember things like how the player is doing or what the current goal is. That's what the State is for. As mentioned in [setup](#setup), `state` is added to the runtime for easy access and modification.

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

A disposable is actually just this, so you can call that method to manually do things if you like.

```ts
interface Disposable {
  dispose(): void
}
```

### setDisplay

Your game needs to look nice with some visuals. So you need to give the app something to put on the display. Call `setDisplay` to put an [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) in the app's screen for your players to see. What your game looks like is up to you so you can put whatever you like in there. The style of the screen makes it so the display is always square and roughly around 400x400 pixels.

This returns a `Disposable`, which makes it easy to remove the display afterwards using [disposables](#disposables).

If you want to use a HTMLCanvas, see [createCanvas](#createcanvas) in the Game Library section.

---

## Game library

There are a set of tools and types in `game_lib` you can use to help write your games. Everything should be imported from the `mod.js` file.

> Yes its weird you have to import a TypeScript file with .js, it's complicated.

### Using TypeScript

You can import the `Runtime` object from the game library which goes most of the way to writing a game in TypeScript. This helps with autocompletion and code linting. For example:

```ts
import { Runtime } from '../../game_lib/mod.js'

interface State {
  score: 0
}

export function setup(runtime: Runtime): State {
  return { score: 0 }
}
export function update(runtime: Runtime<State>, dt: number) {}
export function teardown({ state }: Runtime<State>) {
  return { score: state.score }
}
```

> Make sure your import path matches where game_lib.mod.js relatively from your game script.

### createCanvas

If you want to draw things, a HTMLCanvas is what you might want, and there is a helper to create one of those for you, `createCanvas`. Import it from the game lib, and call it to create a `CanvasContext`. CanvasContext is an object that wraps the canvas `elem`, the `width` and `height` and a drawing `ctx` that you can use to render things. This works nicely when stored in your [state](#state).

> It does a little magic to make the canvas look crisper by looking at window.[devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) and multiplying the actual size up but you only ever have to work with the width/height you pass to this method.

```ts
import { Runtime, createCanvas, CanvasContext } from '../../game_lib/mod.js'

interface State {
  canvas: CanvasContext<'2d'>
}

export function setup({ setDisplay, disposables }: Runtime): State {
  const canvas = createCanvas('2d', 400, 400)
  disposables.add(setDisplay(canvas.elem))
  return { canvas }
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
import { animate } from '../../game_lib/mod.js'

await animate(3_000, (factor) => {
  // ...
})
```

### animateCanvas

> **Unstable** We're still working this API out

For if you want to animate between values and draw to a canvas.

```ts
import { animateCanvas } from '../../game_lib/mod.js'

await animateCanvas(canvas, 3_000, (factor) => {
  // ...
})
```

> The [boot](/app/scenes/boot.ts) uses this quite a bit if you'd like inspiration. It uses animate under the hood and adds a bit to clear previous rendering and manage the `ctx`.

### css

If your game is HTML based and you'd like some style, `css` is here to help. It is a [template literal tag function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), which means you can call it with a multi-line string. It returns a function that will create a [HTMLStyleElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLStyleElement) with the template string as the CSS contents.

```ts
import { css } from '../../game_lib/mod.js'

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

> Some IDEs will automatically syntax-highlight the nested CSS, which is the reason this is called simply `css`.

## Registering a game

For the app to load a game, it must be configured to in [app/main.ts](/app/main.ts),
in the `games` record:

```ts
const games: Record<string, () => Promise<Game>> = {
  demo: () => import('../games/demo/demo.js'),
  snake: () => import('../games/snake/snake.js'),
  // YOUR_GAME_GOES_HERE
}
```

Each entry in this object is a key, the id of your game, and a function to asynchronously import your game. This uses some [Parcel bundle-splitting](https://parceljs.org/features/code-splitting/) magic, so only one game is loaded at once.

To test your game, add it to the `games` record and set the `demoGame` variables below that to your game id. Don't leave that hacks in of course!
