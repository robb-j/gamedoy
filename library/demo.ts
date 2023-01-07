import { bootScene, create2dCanvas, Gamedoy, Scene } from './module.js'

export const helloWorld: Scene = {
  setup({ disposables, setDisplay, finish, controls }) {
    const canvas = create2dCanvas(400, 400)

    disposables.add(
      setDisplay(canvas.elem),
      controls.onKeyUp('A', () => finish())
    )

    canvas.ctx.font = '42px Pixeboy'
    canvas.ctx.textAlign = 'center'
    canvas.ctx.fillStyle = 'white'
    canvas.ctx.fillText('Hello, world!', 200, 200)
  },
}

async function main() {
  Gamedoy.setup()

  const gamedoy = document.querySelector<Gamedoy>('gamedoy-console')
  if (!gamedoy) throw new Error('"gamedoy-console" not found')

  await gamedoy.runScene(bootScene, {
    version: 'v0.1.2',
  })

  await gamedoy.runScene(helloWorld, {})
}

main()
