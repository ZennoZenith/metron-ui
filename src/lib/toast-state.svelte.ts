import { uuidv4 } from "$lib";
import type { Toast, ToastType } from "$lib/types";
import { getContext, onDestroy, setContext } from "svelte";

const DEFAULT_TOAST_DURATION_TIME = 5000; // in milliseconds
export class ToastState {
  private _toasts = $state<Toast[]>([]);
  private _toasted: Toast[] = [];
  private _toastToTimeout = new Map<string, number>();

  constructor() {
    onDestroy(() => {
      for (const timeout of this._toastToTimeout.values()) {
        clearTimeout(timeout);
      }
      this._toastToTimeout.clear();
    });
  }

  add(toastType: ToastType, message: string, title: string = "", durationMs = DEFAULT_TOAST_DURATION_TIME) {
    const value: Toast = {
      id: uuidv4(),
      toastType,
      title,
      message,
    };
    console.log(value);
    this._toasts.push(value);

    this._toastToTimeout.set(
      value.id,
      setTimeout(() => {
        this.remove(value.id);
      }, durationMs),
    );
  }

  remove(id: string) {
    const timeout = this._toastToTimeout.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this._toastToTimeout.delete(id);
    }
    this._toasts = this._toasts.filter((v) => v.id !== id);
  }

  info(message: string, title: string = "", durationMs = DEFAULT_TOAST_DURATION_TIME) {
    this.add("INFO", message, title, durationMs);
  }

  success(message: string, title: string = "", durationMs = DEFAULT_TOAST_DURATION_TIME) {
    this.add("SUCCESS", message, title, durationMs);
  }

  warning(message: string, title: string = "", durationMs = DEFAULT_TOAST_DURATION_TIME) {
    this.add("WARNING", message, title, durationMs);
  }

  error(message: string, title: string = "", durationMs = DEFAULT_TOAST_DURATION_TIME) {
    this.add("ERROR", message, title, durationMs);
  }

  get toasts() {
    return this._toasts;
  }

  get toasted() {
    return this._toasted;
  }
}

const TOAST_KEY = Symbol("TOAST");

export function setToastState() {
  return setContext(TOAST_KEY, new ToastState());
}
export function getToastState() {
  return getContext<ReturnType<typeof setToastState>>(TOAST_KEY);
}
