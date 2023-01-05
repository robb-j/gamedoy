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

> **Unstable**

Setup a HTML document like kinda this:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>🎮 Gamedoy | {{ title }}</title>
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

```ts
import { bootScene, Gamedoy } from 'https://gamedoy.r0b.io/script.js'

async function main() {
  Gamedoy.setup()

  // If using TypeScript, cast as `Gamedoy`
  const gamedoy = document.querySelector('gamedoy-console')

  await gamedoy.runScene(bootScene, {})

  // ...
}

main()
```

Next, create your own scene (TypeScript recommended)...

> TODO:
