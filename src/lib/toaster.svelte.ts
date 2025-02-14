import { DEFAULT_TOAST_DURATION_TIME } from "$constants";
import type { Toast, ToastType } from "$type";
import { clamp, uuidv4 } from "$utils/helpers";
import { getContext, onDestroy, setContext } from "svelte";
import { Log } from "./logger";

type Hover = "pause" | "pause-all" | null;
export class Toaster {
  private _toasts = $state<Toast[]>([]);
  private _toasted: Toast[] = [];
  private _toastToTimeout = new Map<string, Timer>();
  private hover: Hover;
  private defaultToastDurationMs: number;
  constructor(options?: { defaultToastDurationMs?: number; hover?: Hover }) {
    this.hover = options?.hover ?? "pause";
    this.defaultToastDurationMs = options?.defaultToastDurationMs ?? DEFAULT_TOAST_DURATION_TIME;

    onDestroy(() => {
      for (const timeout of this._toastToTimeout.values()) {
        clearTimeout(timeout);
      }
      this._toastToTimeout.clear();
    });
  }

  add(toastType: ToastType, message: string, title: string = "", durationMs: number = this.defaultToastDurationMs) {
    const now = Date.now();
    const value: Toast = {
      id: uuidv4(),
      toastType,
      title,
      message,
      durationMs: durationMs,
      createdAtMs: now,
      psudoStartAtMs: now,
      pause: {
        paused: false,
        pauseAtRatio: 0,
        pausedAtMs: 0,
      },
    };
    Log.debug(value);
    this._toasts.push(value);

    this._toastToTimeout.set(
      value.id,
      setTimeout(() => {
        if (durationMs === 0) {
          return;
        }
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

  getPercentage(id: string) {
    const toast = this._toasts.find((v) => v.id === id);
    if (!toast) return 0;

    if (toast.durationMs === 0) return 0;
    if (toast.pause.paused) return clamp(toast.pause.pauseAtRatio, 0, 1) * 100;

    const toastedTime = Date.now() - toast.psudoStartAtMs;
    const toastedPercentage = clamp(toastedTime, 0, toast.durationMs) * 100 / toast.durationMs;
    return toastedPercentage;
  }

  pause(id: string) {
    if (this.hover === null) return;

    if (this.hover === "pause") {
      const toast = this._toasts.find((v) => v.id === id);
      this._pauseToast(toast);
      return;
    }

    if (this.hover === "pause-all") {
      this._toasts.forEach(toast => this._pauseToast(toast));
      return;
    }
  }

  resume(id: string) {
    if (this.hover === null) return;

    if (this.hover === "pause") {
      const toast = this._toasts.find((v) => v.id === id);
      this._resumeToast(toast);
      return;
    }

    if (this.hover === "pause-all") {
      this._toasts.forEach(toast => this._resumeToast(toast));
      return;
    }
  }

  private _pauseToast(toast?: Toast) {
    if (!toast) return;
    if (toast.pause.paused === true) return;
    if (toast.durationMs === 0) return;

    const timeout = this._toastToTimeout.get(toast.id);
    if (timeout) {
      clearTimeout(timeout);
      this._toastToTimeout.delete(toast.id);
    }
    const now = Date.now();
    const doneMs = now - toast.psudoStartAtMs;
    toast.pause.paused = true;
    toast.pause.pausedAtMs = now;
    toast.pause.pauseAtRatio = clamp(doneMs, 0, toast.durationMs) / toast.durationMs;
  }

  private _resumeToast(toast?: Toast) {
    if (!toast) return;
    if (toast.pause.paused === false) return;
    if (toast.durationMs === 0) return;

    const now = Date.now();
    toast.psudoStartAtMs = toast.psudoStartAtMs + now - toast.pause.pausedAtMs;
    toast.pause.paused = false;

    const remainingMs = (1 - toast.pause.pauseAtRatio) * toast.durationMs;
    this._toastToTimeout.set(
      toast.id,
      setTimeout(() => {
        if (remainingMs === 0) {
          return;
        }
        this.remove(toast.id);
      }, remainingMs),
    );
  }

  info(message: string, title: string = "", durationMs?: number) {
    this.add("INFO", message, title, durationMs);
  }

  success(message: string, title: string = "", durationMs?: number) {
    this.add("SUCCESS", message, title, durationMs);
  }

  warning(message: string, title: string = "", durationMs?: number) {
    this.add("WARNING", message, title, durationMs);
  }

  error(message: string, title: string = "", durationMs?: number) {
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

export function setToaster(options?: ConstructorParameters<typeof Toaster>[0]) {
  return setContext(TOAST_KEY, new Toaster(options));
}

export function getToaster() {
  return getContext<ReturnType<typeof setToaster>>(TOAST_KEY);
}
