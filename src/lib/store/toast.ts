import type { Toast, ToastType } from "$lib";
import { type Writable, writable } from "svelte/store";

class Toaster {
  private _toast: Writable<Toast[]>;
  private _toasted: Toast[];
  constructor() {
    this._toast = writable([]);
    this._toasted = [];
  }
  subcribe(callback?: (value: Toast[]) => void) {
    return this._toast.subscribe((value) => {
      console.log(value);

      if (callback) {
        callback(value);
      }
    });
  }
  set(value: Toast) {
    this._toast.set([value]);
  }
  update(toastType: ToastType, message: string) {
    const value: Toast = {
      id: crypto.randomUUID(),
      toastType,
      message,
    };
    console.log(value);
    this._toast.update((v) => [...v, value]);
  }
  info(message: string) {
    this.update("INFO", message);
  }

  success(message: string) {
    this.update("SUCCESS", message);
  }

  warning(message: string) {
    this.update("WARNING", message);
  }

  error(message: string) {
    this.update("ERROR", message);
  }

  get toasted() {
    return this._toasted;
  }
}

export const toast = new Toaster();
