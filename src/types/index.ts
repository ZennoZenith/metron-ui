import type { POSSIBLE_HTTP_CODE } from "$utils/http-codes";

// https://timdeschryver.dev/bits/pretty-typescript-types
/**
 * A TypeScript type alias called `Prettify`.
 * It takes a type as its argument and returns a new type that has the same properties as the original type,
 * but the properties are not intersected. This means that the new type is easier to read and understand.
 */
export type Prettify<T> =
  & {
    [K in keyof T]: T[K];
  }
  & {};

export type ToastType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export type Toast = {
  id: string;
  toastType: ToastType;
  title: string;
  message: string;
  durationMs: number;
  createdAtMs: number;
  psudoStartAtMs: number;
  pause: {
    paused: boolean;
    pausedAtMs: number;
    pauseAtRatio: number;
  };
};

export type InternalApiError = {
  "httpCode": POSSIBLE_HTTP_CODE;
  "errorCode": number;
  "title": string;
  "error": string;
  "href": string;
};

export type DropDownListItem<T extends Record<string, unknown> = { nothing: "" }> = {
  key: string;
  text: string;
  dataText: string;
  disabled?: boolean;
  selected: boolean;
  extra: T;
};

export type SubscribeAction = "CREATE" | "UPDATE" | "DELETE";

export type Taged = {
  readonly _tag: string;
};
