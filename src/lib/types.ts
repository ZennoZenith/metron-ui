export type ToastType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export type Toast = {
  id: string;
  toastType: ToastType;
  title: string;
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
