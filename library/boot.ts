import { animate2dCanvas, pause } from './animation.js'
import { CanvasContext2D, create2dCanvas } from './display.js'
import { Runtime } from './gamedoy.js'

interface Params {
  width?: number
  height?: number
  title?: string
  version?: string
}

export async function setup(
  { disposables, setDisplay, finish }: Runtime,
  params: Params
) {
  const {
    width = 400,
    height = 400,
    title = 'Gamedoy',
    version = 'v1.2.3',
  } = params

  const canvas = create2dCanvas(width, height)
  disposables.add(setDisplay(canvas.elem))

  await playIntro(canvas, title, version)

  finish()
}

async function playIntro(
  canvas: CanvasContext2D,
  title: string,
  version: string
) {
  await pause(500)

  await animate2dCanvas(canvas, 1_000, (f) => {
    let offset = -f * 20

    canvas.ctx.font = '42px Pixeboy'
    canvas.ctx.fillStyle = `rgba(255, 255, 255, ${f.toFixed(2)})`
    canvas.ctx.textAlign = 'center'
    canvas.ctx.fillText(title, 200, offset + 140)

    canvas.ctx.font = '28px Pixeboy'
    canvas.ctx.fillText(version, 200, offset + 180)
  })

  await pause(1_000)

  await animate2dCanvas(canvas, 300, (f) => {
    canvas.ctx.font = '42px Pixeboy'
    canvas.ctx.fillStyle = `rgba(255, 255, 255, ${(1 - f).toFixed(2)})`
    canvas.ctx.textAlign = 'center'
    canvas.ctx.fillText(title, 200, 120)

    canvas.ctx.font = '28px Pixeboy'
    canvas.ctx.fillText(version, 200, 160)
  })
}
