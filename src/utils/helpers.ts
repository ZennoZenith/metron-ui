import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function uuidv4() {
  if (window?.isSecureContext) {
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
