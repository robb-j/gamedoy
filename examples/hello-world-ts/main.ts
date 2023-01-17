import { Gamedoy, bootScene } from '@robb_j/gamedoy'

async function main() {
  // Setup Gamedoy and grab the custom element
  const gamedoy = Gamedoy.setup({ el: '#app' })

  // Run the boot scene
  await gamedoy.run(bootScene)
}

main()
