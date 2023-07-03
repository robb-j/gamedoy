import { bootScene, Gamedoy, iframeScene, Scene } from './mod.js'

type IframeScene = Scene<null, undefined, { score: number }>

async function main() {
  const gamedoy = Gamedoy.setup({ el: 'gamedoy-console' })

  await gamedoy.run(bootScene, {
    version: 'v0.1.2',
  })

  const scene = iframeScene('https://snake.andrsn.uk/', {
    width: 400,
    height: 400,
  }) as IframeScene

  while (true) {
    const result = await gamedoy.run(scene)
    alert('Game over, you scored: ' + result.score)
  }
}

main()
