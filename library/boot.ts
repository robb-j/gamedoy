import { animate2dCanvas, pause } from './animation.js'
import { CanvasContext2D, create2dCanvas } from './display.js'
import { Runtime } from './gamedoy.js'

interface Params {
  title?: string
  version?: string
  font?: string
}

export async function setup(
  { disposables, setDisplay, finish }: Runtime,
  params: Params
) {
  const { title = 'Gamedoy', version = 'v1.2.3', font = 'Pixeboy' } = params

  const canvas = create2dCanvas(400, 400)
  disposables.add(setDisplay(canvas.elem))

  await playIntro(canvas, title, version, font)

  finish()
}

async function playIntro(
  canvas: CanvasContext2D,
  title: string,
  version: string,
  font: string
) {
  await pause(500)

  await animate2dCanvas(canvas, 1_000, (f) => {
    let offset = -f * 20

    canvas.ctx.font = `42px ${font}`
    canvas.ctx.fillStyle = `rgba(255, 255, 255, ${f.toFixed(2)})`
    canvas.ctx.textAlign = 'center'
    canvas.ctx.fillText(title, 200, offset + 140)

    canvas.ctx.font = `28px ${font}`
    canvas.ctx.fillText(version, 200, offset + 180)
  })

  await pause(1_000)

  await animate2dCanvas(canvas, 300, (f) => {
    canvas.ctx.font = `42px ${font}`
    canvas.ctx.fillStyle = `rgba(255, 255, 255, ${(1 - f).toFixed(2)})`
    canvas.ctx.textAlign = 'center'
    canvas.ctx.fillText(title, 200, 120)

    canvas.ctx.font = `28px ${font}`
    canvas.ctx.fillText(version, 200, 160)
  })
}
