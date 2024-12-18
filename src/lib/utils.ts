import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const HTTP_NO_CONTENT = 204 as const;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

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

export function catchErrorSync<T, E extends { message: string } = Error>(
  fn: Function,
  ...args: any[]
): [undefined, T] | [E] {
  try {
    const data = fn(...args);
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

export async function fetchEmpty(
  url: RequestInfo | URL,
  init?: RequestInit,
): Promise<Superposition<{}, {}>> {
  const errorRes = await catchError<Response>(fetch(url, init));
  if (errorRes[0]) {
    return {
      success: false,
      httpCode: 500,
      error: { type: "GENERIC", messages: [errorRes[0].message] },
    };
  }

  if (errorRes[1].status === HTTP_NO_CONTENT) {
    return {
      success: true,
      data: {},
    };
  }
  const errorText = await catchError<string>(errorRes[1].text());
  const errorJson = catchErrorSync<ApiError>(JSON.stringify, errorText[1]);

  console.error("Error Json");
  console.error(errorJson[0]);
  console.error(errorJson[1]);
  console.error("Error Res");
  console.error(errorRes[1]);

  if (errorJson[0] === undefined && errorRes[1].status !== HTTP_NO_CONTENT && "error" in errorJson[1]) {
    return {
      success: false,
      httpCode: errorJson[1].httpCode,
      error: { type: "GENERIC", messages: [errorJson[1].error] },
    };
  }
  return {
    success: false,
    httpCode: errorRes[1].status,
    error: { type: "GENERIC", messages: [errorRes[1].statusText] },
  };
}

export async function fetchJson<T extends {}>(
  url: RequestInfo | URL,
  init?: RequestInit,
): Promise<Superposition<{}, T>> {
  const errorRes = await catchError<Response>(fetch(url, init));
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
