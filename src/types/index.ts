import type { POSSIBLE_HTTP_CODE } from "$utils/http-codes";

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

export type DropDownListItem = {
  key: string;
  text: string;
  dataText: string;
  disabled?: boolean;
  selected: boolean;
};
