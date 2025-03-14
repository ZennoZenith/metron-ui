import { browser } from "$app/environment";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function uuidv4() {
  if (browser && window?.isSecureContext) {
    return crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(
    /[018]/g,
    c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16),
  );
}

export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isEmptyString(str?: string | null) {
  if (!str) return true;

  if (str.trim().length === 0) return true;

  return false;
}

export function setEmptyStringAsNullish(value?: string | null): string | undefined {
  if (isEmptyString(value)) return undefined;
  return value?.trim() as string;
}

export function uniqByKeepLast<K extends string, T extends Record<K, unknown>>(data: T[], key: (obj: T) => T[keyof T]) {
  return [
    ...new Map(
      data.map(x => [key(x), x]),
    ).values(),
  ];
}

export function exhaustiveMatchingGuard(_: never, message?: string): never {
  throw new Error(message ?? "Should not have reached here");
}

export const LogLevels = ["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"] as const;

export function toLogLevel(value?: string): typeof LogLevels[number] {
  if (value && LogLevels.includes(value as typeof LogLevels[number])) {
    return value as typeof LogLevels[number];
  }
  return "WARN";
}
