export const config = {
  miniModeSize: 350,
  ngageModeSize: 800,
}

function reconstruct<T extends unknown[]>(
  strings: TemplateStringsArray,
  ...args: T
) {
  const parts = []

  for (let i = 0; i < strings.length; i++) {
    parts.push(strings[i])
    if (args[i]) parts.push(args[i])
  }

  return parts.join('')
}

export const html = reconstruct
export const css = reconstruct

/**
  A wrapper around `CSSStyleSheet` that falls back to a `HTMLStyleElement` when unsupported.
  Looking at you Safari 👀
  Roughly maps to the signature of `CSSStyleSheet` to make migrating away easier in the future
*/
export class ShadowStyle {
  #raw = ''
  #sheet: CSSStyleSheet | undefined

  get sheet(): CSSStyleSheet {
    if (this.#sheet) return this.#sheet
    this.#sheet = new CSSStyleSheet()
    this.#sheet.replaceSync(this.#raw)
    return this.#sheet
  }
  get element(): HTMLStyleElement {
    const style = document.createElement('style')
    style.innerHTML = this.#raw
    return style
  }

  static patch(root: Document | ShadowRoot, styles: ShadowStyle[]) {
    try {
      root.adoptedStyleSheets = styles.map((s) => s.sheet)
    } catch (error) {
      let node = root instanceof ShadowRoot ? root : root.body
      node.append(...styles.map((s) => s.element))
    }
  }

  constructor() {}
  replaceSync(newRaw: string) {
    this.#raw = newRaw
  }
}

/* --gdy-theme: #016fb9; */
/* --gdy-theme: #ff6b6c; */
/* --gdy-theme: #ffc144; */
/* --gdy-theme: #ec0868; */
/* --gdy-theme: #c200fb; */
/* --gdy-theme: #fc3000; */

export const baseStyle = new ShadowStyle()
baseStyle.replaceSync(css`
  /* https://www.fontspace.com/pixeboy-font-f43730 */
  @font-face {
    font-family: 'Pixeboy';
    src: url('/Pixeboy.ttf') format('opentype');
    font-weight: 400;
    font-style: normal;
  }

  :root {
    --gdy-theme: #3cdd59;

    --gdy-ratio: 1.5;
    --gdy-s-5: calc(var(--gdy-s-4) / var(--gdy-ratio));
    --gdy-s-4: calc(var(--gdy-s-3) / var(--gdy-ratio));
    --gdy-s-3: calc(var(--gdy-s-2) / var(--gdy-ratio));
    --gdy-s-2: calc(var(--gdy-s-1) / var(--gdy-ratio));
    --gdy-s-1: calc(var(--gdy-s) / var(--gdy-ratio));
    --gdy-s: 1rem;
    --gdy-s1: calc(var(--gdy-s) * var(--gdy-ratio));
    --gdy-s2: calc(var(--gdy-s1) * var(--gdy-ratio));
    --gdy-s3: calc(var(--gdy-s2) * var(--gdy-ratio));
    --gdy-s4: calc(var(--gdy-s3) * var(--gdy-ratio));
    --gdy-s5: calc(var(--gdy-s4) * var(--gdy-ratio));

    --frame: var(--gdy-s-1);
    --display: calc(400px + calc(2 * var(--frame)));
    --gutter: var(--gdy-s);
    --line: var(--gdy-s-5);
  }

  button {
    margin: 0;
    border: var(--line) solid rgba(0, 0, 0, 0.25);
    background-color: rgba(255, 255, 255, 0.4);
    font-size: 24px;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.8);

    user-select: none !important;
    font-family: 'Pixeboy', ui-monospace, monospace;
    /* TODO — parcel ignores the prefixed if this is set */
    /* user-select: none !important; */
  }
  button:active {
    filter: none;
    background-color: rgba(255, 255, 255, 0.2);
  }
`)
