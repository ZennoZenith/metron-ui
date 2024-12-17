import { type InferOutput, pipe, string, uuid } from "valibot";

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
  [key: string]: {
    message: string;
    [key: string]: any;
  };
};

export type DropDownListItem = {
  key: string;
  text: string;
  dataText: string;
  disabled?: boolean;
  selected: boolean;
};

export const UuidSchema = pipe(string(), uuid("The UUID is badly formatted."));
export type Uuid = InferOutput<typeof UuidSchema>;
