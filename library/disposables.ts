export interface Disposable {
  dispose(): void
}

export class CompositeDisposable implements Disposable {
  #disposables: Disposable[] = []

  add(...ds: Disposable[]) {
    this.#disposables.push(...ds)
  }
  remove(...ds: Disposable[]) {
    this.#disposables = this.#disposables.filter((d) => !ds.includes(d))
  }
  dispose(): void {
    for (const d of this.#disposables) d.dispose()
    this.#disposables = []
  }
}

export function disposable(fn: () => void) {
  return { dispose: fn }
}
