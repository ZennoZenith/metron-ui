// place files you want to import through the `$lib` alias in this folder.
export type ToastType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export type Toast = {
  id: string;
  toastType: ToastType;
  message: string;
};

export type InternalApiError = {
  [key: string]: {
    message: string;
    [key: string]: any;
  };
};

export type Tag = {
  id: string;
  title: string;
};

export const API_BASE_ROUTE = "http://localhost:8081/api";
