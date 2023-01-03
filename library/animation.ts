import { CanvasContext } from './display.js'

/** Run a block every frame for `durationMs` */
export function animate(durationMs: number, block: (factor: number) => void) {
  return new Promise<void>((resolve) => {
    const startTime = Date.now()

    function tick() {
      let f = Math.min(1, (Date.now() - startTime) / durationMs)
      block(f)
      if (f < 1) requestAnimationFrame(tick)
      else resolve()
    }

    requestAnimationFrame(tick)
  })
}

/** @experimental */
export function animate2dCanvas(
  { ctx, width, height }: CanvasContext<CanvasRenderingContext2D>,
  durationMs: number,
  block: (f: number) => void
) {
  return animate(durationMs, (f) => {
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    block(f)
    ctx.restore()
  })
}

export function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
