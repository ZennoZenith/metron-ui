export class Result<T, E> {
  #ok?: T;
  #err?: E;

  constructor(ok?: T, err?: E) {
    this.#ok = ok;
    this.#err = err;
  }

  get obj() {
    return {
      ok: this.#ok,
      err: this.#err,
    } as const;
  }

  unwrap() {
    if (!this.#ok) throw new Error("Unwrapping empty result", { cause: this.#err });
    return this.#ok;
  }

  isOk() {
    return this.#ok !== undefined && this.#ok !== null;
  }

  isErr() {
    return this.#err !== undefined && this.#err !== null;
  }

  get ok() {
    return this.#ok;
  }

  get err() {
    return this.#err;
  }
}

export function Ok<T>(ok: T) {
  return new Result<T, never>(ok);
}

export function Err<E>(err: E) {
  return new Result<never, E>(undefined, err);
}

export const isOk = <T, E>(value: Result<T, E>): value is Result<T, never> => value.isOk();

export const isErr = <T, E>(value: Result<T, E>): value is Result<never, E> => value.isErr();
