import { getContext, setContext } from "svelte";

class MySet<T extends object, K extends keyof T> {
  private list: T[] = $state<T[]>([]);
  private key: K;
  // private set: Set<T[typeof this.key]>;
  constructor(key: K, list?: T[]) {
    this.list = list ?? [];
    this.key = key;
    // this.set = new Set();
  }

  add(value: T) {
    const item = this.list.filter(v => v[this.key] !== value[this.key]);
    item.push(value);
    this.list = item;
    return this;
  }

  clear() {
    this.list = [];
  }

  delete(value: T) {
    const found = this.list.findIndex(v => v[this.key] === value[this.key])  !== -1;

    if (found) {
      this.list = this.list.filter(v => v[this.key] !== value[this.key]);
    }

    return found;
  }

  deleteByKey(value: T[K]) {
    const found = this.list.findIndex(v => v[this.key] === value)  !== -1;

    if (found) {
      this.list = this.list.filter(v => v[this.key] !== value);
    }

    return found;
  }

  has(value: T) {
    return this.list.findIndex(v => v[this.key] === value[this.key])  !== -1;
  }

  hasKey(value: T[K]) {
    return this.list.findIndex(v => v[this.key] === value)  !== -1;
  }

  get keys() {
    return this.list.map(v => v[this.key]);
  }

  get values() {
    return this.list as ReadonlyArray<T>;
  }
}

// const SET_KEY = Symbol("TOAST");

export function setMySet<T extends object, K extends keyof T>(
  symbol: symbol,
  key: K,
  list?: T[],
) {
  return setContext(symbol, new MySet<T, K>(key, list));
}
export function getMySet(symbol: symbol) {
  return getContext<ReturnType<typeof setMySet>>(symbol);
}
