import {
  bootScene,
  create2dCanvas,
  css,
  Gamedoy,
  html,
  Runtime,
} from './mod.js'

const helloWorld = {
  setup({ disposables, setDisplay, finish, controls }: Runtime) {
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

const listStyle = css`
  .listScene > * + * {
    padding-top: 0.5em;
    border-top: 2px solid black;
    margin-top: 0.5em;
  }
  .listScene p {
    margin-bottom: 0;
    font-size: 16px;
    text-align: center;
  }
`

const listTemplate = document.createElement('template')
listTemplate.innerHTML = html`
  <style>
    ${listStyle}
  </style>
  <div class="listScene">
    <p>Option A</p>
    <p>Option B</p>
    <p>Option C</p>
    <p>Option D</p>
    <p>Option E</p>
    <p>Option F</p>
    <p>Option G</p>
  </div>
`

const list = {
  setup({ disposables, setDisplay, finish }: Runtime<null, string>) {
    const elem = document.createElement('div')
    elem.append(listTemplate.content.cloneNode(true))

    disposables.add(setDisplay(elem))

    for (const p of elem.querySelectorAll<HTMLParagraphElement>('p')) {
      p.onclick = () => {
        finish(p.textContent ?? 'unknown')
      }
    }
  },
}

async function main() {
  const gamedoy = Gamedoy.setup({ el: 'gamedoy-console' })

  await gamedoy.run(bootScene, {
    version: 'v0.1.2',
  })

  await gamedoy.run(helloWorld)

  const answer = await gamedoy.run(list)

  alert('You chose:' + answer)
}

main()
