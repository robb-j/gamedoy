//
// NOT_USED
//

function reconstruct<T extends unknown[]>(
  strings: TemplateStringsArray,
  args: T
) {
  const parts = []

  for (let i = 0; i < strings.length; i++) {
    parts.push(strings[i])
    if (args[i]) parts.push(args[i])
  }

  return parts.join('')
}

function element(name: string, html: string) {
  const elem = document.createElement(name)
  elem.innerHTML = html
  return elem
}

export function html(strings: TemplateStringsArray, ...args: unknown[]) {
  return element('template', reconstruct(strings, args)) as HTMLTemplateElement
}

export function css(strings: TemplateStringsArray, ...args: unknown[]) {
  return element(
    'style',
    reconstruct(strings, args).replace(/\s\s+/g, ' ').trim()
  ) as HTMLStyleElement
}
