---
layout: html.njk
title: Docs
---

# Gamedoy docs

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
  </head>
  <body>
    <gamedoy-console id="app"></gamedoy-console>
    <script type="module" src="./script.js"></script>
  </body>
</html>
```

With a script next to it like this:

```js
import { Gamedoy, bootScene } from 'https://gamedoy.r0b.io/mod.js'
import * as helloWorld from './my-scene.js'

async function main() {
  // Setup Gamedoy and grab the custom element
  const gamedoy = Gamedoy.setup({ el: '#app' })

  await gamedoy.run(bootScene)

  await gamedoy.run(helloWorld)
}

main()
```

Next, let's create a our scene, **my-scene.js**:

```js
export function setup({ disposables, setDisplay, finish, controls }) {
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
}
```

Then serve your HTML over HTTP and visit it in your web browser.

```sh
# e.g. using npm.im/serve
npx serve .
```

---

Next:

- [Install →]({{ '/install/' | url }})
- [Game dev →]({{ '/game-dev/' | url }})
- [Run games →]({{ '/run-games' | url }})
