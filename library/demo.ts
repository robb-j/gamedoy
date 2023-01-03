import { bootScene, Gamedoy } from './module.js'

Gamedoy.setup()

const elem = document.querySelector<Gamedoy>('gamedoy-console')
if (!elem) throw new Error('"gamedoy-console" not found')

elem.runScene(bootScene, {
  version: 'v0.1.2',
})
