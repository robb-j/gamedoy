---
layout: html.njk
title: Install
---

# Install

So you want to play around with Gamedoy, excellent. Follow these steps to get started. This guide uses [parcel](https://parceljs.org/) to bundle assets together and serve them for development, but there are lots of other options if you're interested.

First pop open a terminal and setup a node project:

```sh
# Create an empty NPM project if you don't already have one
npm init --yes

# Install Gamedoy
npm install @robb_j/gamedoy

# Install development dependencies
npm install --save-dev parcel
```

Then setup a HTML page, `index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>🎮 Gamedoy</title>
    <meta charset="utf8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="stylesheet" href="npm:@robb_j/gamedoy/dist/simple.css" />
  </head>
  <body>
    <gamedoy-console id="app"></gamedoy-console>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

And your script, `main.js`:

```js
import { Gamedoy, bootScene } from '@robb_j/gamedoy'

async function main() {
  // Setup Gamedoy and grab the custom element
  const gamedoy = Gamedoy.setup({ el: '#app' })

  // Run the boot scene
  await gamedoy.run(bootScene)
}

main()
```

Now run the website locally:

```sh
npx parcel index.html
```

Then open up `http://localhost:1234` to check it all worked! 🎉

## TypeScript usage

Gamedoy is written in TypeScript and all the types are included to help you write games. In fact TypeScript is the recommended way to use Gamedoy! To adapt the example above with TypeScript:

```bash
# Install TypeScript
npm install --save-dev typescript
```

And add a `tsconfig.json` (with some options to help find more errors):

```json
{
  "compilerOptions": {
    "target": "es2020",
    "moduleResolution": "Node16",
    "module": "ES2020",

    "sourceMap": true,
    "declaration": true,
    "newLine": "lf",
    "stripInternal": true,
    "pretty": true,
    "emitDeclarationOnly": true,

    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noEmitOnError": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["*"]
}
```

Then rename your `main.js` to `main.ts` and update the reference in your `index.html` to point to the TypeScript file instead.

🎉 Thats all you need!

---

Next:

- [Game dev →]({{ '/game-dev/' | url }})
- [Run games]({{ '/run-games' | url }})
