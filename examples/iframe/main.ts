import { Gamedoy, iframeScene } from '@robb_j/gamedoy'

async function main() {
  // Setup Gamedoy and grab the custom element
  const gamedoy = Gamedoy.setup({ el: '#app' })

  const iScene = iframeScene('./child.html', {
    width: 400,
    height: 400,
    allow: 'accelerometer; gyroscope',
  })

  // Run the boot scene
  const result = await gamedoy.run(iScene)
  console.log('RESULT', result)
}

main()
