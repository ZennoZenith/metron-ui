export class Result<T, E extends Error> {
  #ok?: T;
  #err?: E;

  constructor(ok?: T, err?: E) {
    this.#ok = ok;
    this.#err = err;
  }

  unwrap() {
    if (this.#ok === undefined || this.#ok === null) throw new Error("Unwrapping empty result", { cause: this.#err });
    return this.#ok as NonNullable<T>;
  }

  unwrapOr(fn: () => NonNullable<T>) {
    if (!this.#ok) {
      return fn();
    } else {
      return this.#ok;
    }
  }

  unwrapErr() {
    if (this.#err === undefined || this.#err === null) throw new Error("Unwrapping empty error", { cause: this.#ok });
    return this.#err as NonNullable<E>;
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

export function Err<E extends Error>(err: E) {
  return new Result<never, E>(undefined, err);
}

export const isOk = <T, E extends Error>(value: Result<T, E>): value is Result<T, never> => value.isOk();

export const isErr = <T, E extends Error>(value: Result<T, E>): value is Result<never, E> => value.isErr();
