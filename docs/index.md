---
layout: html.njk
title: Docs
---

# Gamedoy docs (unstable)

A minimalistic fantasy console, kinda like a gameboy, for the web.

> Named after [Cowdoy](https://r0b.url.lol/cowdoy)

## [Demo →]({{ '/demo' | url }})

## About

...

## Usage

Setup a HTML document like kinda this:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>🎮 Gamedoy</title>
    <meta charset="utf8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="stylesheet" href="https://gamedoy.r0b.io/style.css" />
  </head>
  <body>
    <gamedoy-console></gamedoy-console>
    <script type="module" src="./script.js"></script>
  </body>
</html>
```

With a script next to it like this:

```js
import { bootScene, Gamedoy } from 'https://gamedoy.r0b.io/module.js'
import { helloWorld } from './my-scene.js'

async function main() {
  Gamedoy.setup()

  /** @type {Gamedoy} */
  const gamedoy = document.querySelector('gamedoy-console')

  await gamedoy.runScene(bootScene, {})

  await gamedoy.runScene(helloWorld, {})
}

main()
```

Next, let's create a our scene:

**my-scene.js**

```js
import { bootScene, Gamedoy } from 'https://gamedoy.r0b.io/module.js'

export const helloWorld = {
  setup({ disposables, setDisplay, finish, controls }) {
    // Create a canvas to draw to
    const canvas = create2dCanvas(400, 400)

    // Add the screen and listen for "A" presses
    // store the disposable to remove again after the scene finishes
    disposables.add(
      setDisplay(canvas.elem),
      controls.onKeyUp('A', () => finish())
    )

    // Draw some text
    canvas.ctx.font = '42px Pixeboy'
    canvas.ctx.textAlign = 'center'
    canvas.ctx.fillStyle = 'white'
    canvas.ctx.fillText('Hello, world!', 200, 150)
  },
}
```

Then serve your HTML over HTTP and visit it in your web browser.

```sh
# e.g. using npm.im/serve
npx serve .
```

## Next

[Game development](./game-dev/)
