---
layout: html.njk
title: Run games
---

# Run games

In Gamedoy, games are a collection of scenes that can also have [parameters](#parameters) passed into them or return a [result](#results).

## Basic scene

> These examples are written in [TypeScript]({{ '/game-dev/' | url }}#typescript).

Here's a **basic-scene.ts**:

```ts
import { Runtime } from '@robb_j/gamedoy'

export function setup(runtime: Runtime) {
  // game logic goes here
}
```

And this is the **main.ts** script that sets up Gamedoy and runs it:

```js
import { Gamedoy } from '@robb_j/gamedoy'
import * as basicScene from './basic-scene.js'

function main() {
  const gamedoy = Gamedoy.setup({ el: '#app' })

  await gamedoy.run(basicScene)
}

main()
```

`Gamedoy#run` is asynchronous so you can easily wait for the scene to run until completion then do something else.

## Parameters

Scenes can take parameters that let you configure how they run.

This uses the second argument to `setup` that lets you pass in parameters. The best practise is a single object and to use optional fields in case they don't get passed from Gamedoy.

This scene takes a parameter, a name to render, **hello-there.ts**:

```ts
import { Runtime } from '@robb_j/gamedoy'

export interface Params {
  name?: string
}

export function setup(runtime: Runtime, params: Params = {}) {
  // game logic goes here
  console.log('Hello: ' + params.name ?? 'Unknown')
}
```

Then run this scene from **main.ts** and use the parameter:

```js
import { Gamedoy } from '@robb_j/gamedoy'
import * as helloThere from './hello-there.js'

function main() {
  const gamedoy = Gamedoy.setup({ el: '#app' })

  await gamedoy.run(helloThere, {
    name: 'General Kenobi'
  })
}

main()
```

## Results

A result gets a value out of a scene to be used somewhere else. This could be used to return a score or get the name the player entered.

This scene lets the player enter a name and returns it, **name-picker.ts**

```ts
import { Runtime } from '@robb_j/gamedoy'

export interface State {}
export interface Result {
  chosenName: string
}

export function setup({ finish }: Runtime<State, Result>) {
  // name-picker login goes here

  // finish() can be called anytime you like,
  // e.g. in setup, a callback, or from the update or teardown hooks.
  finish('Geoff')
}
```

Then run this scene and grab the name, **main.ts**:

```js
import { Gamedoy } from '@robb_j/gamedoy'
import * as namePicker from './name-picker.js'

function main() {
  const gamedoy = Gamedoy.setup({ el: '#app' })

  const result = await gamedoy.run(namePicker)

  console.log(result.chosenName)
}

main()
```

## iframes

If you've created an [iframe-based]({{ '/game-dev/#iframes' | url }}) scene, you can run it like this:

```js
import { Gamedoy, iframeScene } from '@robb_j/gamedoy'

function main() {
  const gamedoy = Gamedoy.setup({ el: '#app' })

  const scene =  = iframeScene('https://example.com', {
    width: 400,
    height: 400,
    allow: 'accelerometer; gyroscope', // optional extra permissions
  })

  await gamedoy.run(scene)
}

main()
```

You can also create an iframe yourself with `createIframe` if you want more control of the scene. For example, **iframe-scene.ts** below which you can run in the same way as above:

```ts
import { iframeScene } from '@robb_j/gamedoy'

interface State {
  iframe: HTMLIframeElement
}

export function setup(runtime: Runtime<State, void>) {
  const iframe = createIframe('https://example.com', runtime, {
    width: 400,
    height: 400,
  })

  // Clean up the iframe when the scene ends
  runtime.disposables.add(iframe)

  // Do something with the element...
  return { iframe: iframe.elem }
}
```

---

Next:

Wow you made it to here 🥳 I have no more pages to offer you.
Maybe reach out on [mastodon](https://hyem.tech/@rob)?
