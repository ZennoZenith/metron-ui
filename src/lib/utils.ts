import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FormDataValidationError = Record<string, [string, ...string[]] | undefined>;
export type FormError<E extends FormDataValidationError> = {
  type: "VALIDATION";
  messages: [string, ...string[]];
  data: E;
};

export type GenericError = {
  type: "GENERIC";
  messages: [string, ...string[]];
};

export type Superposition<T extends FormDataValidationError = {}, U = {}> = {
  success: false;
  httpCode: number;
  error: FormError<T> | GenericError;
} | {
  success: true;
  data: U;
};

export async function catchError<T, E extends { message: string } = Error>(
  promise: Promise<T>,
): Promise<[undefined, T] | [E]> {
  try {
    const data = await promise;
    return [undefined, data] as [undefined, T];
  } catch (error) {
    return [error] as [E];
  }
}

export type ApiError = {
  "httpCode": number;
  "errorCode": number;
  "title": string;
  "error": string;
  "href": string;
};

export async function fetchJson<T extends {}>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Superposition<{}, T>> {
  const errorRes = await catchError<Response>(fetch(input, init));
  if (errorRes[0]) {
    return {
      success: false,
      httpCode: 500,
      error: { type: "GENERIC", messages: [errorRes[0].message] },
    };
  }

  const errorJson = await catchError<T | ApiError>(errorRes[1].json());

  if (errorJson[0] === undefined && errorRes[1].status > 399 && "error" in errorJson[1]) {
    return {
      success: false,
      httpCode: errorJson[1].httpCode,
      error: { type: "GENERIC", messages: [errorJson[1].error] },
    };
  }

  if (errorJson[0] === undefined) {
    return { success: true, data: errorJson[1] as T };
  }

  return {
    success: false,
    httpCode: errorRes[1].status,
    error: { type: "GENERIC", messages: [errorRes[1].statusText] },
  };
}

export class Debounce {
  private timeout: ReturnType<typeof setTimeout> | undefined;
  private waitTime: number;

  constructor(wait: number = 300) {
    this.waitTime = wait;
  }

  debounce = (callback: Function, wait?: number) => {
    wait ??= this.waitTime;
    return (...args: any[]) => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => callback(...args), wait);
    };
  };

  debounceAsync = (callback: Function, wait?: number) => {
    wait ??= this.waitTime;
    return (...args: any[]) => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(async () => await callback(...args), wait);
    };
  };
}
