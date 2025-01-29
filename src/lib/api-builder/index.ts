import { API_HOST, API_PORT, API_PROTOCOL, API_VRSION } from "$constants";

// type FetchOptions = {
//   url: string;
//   headers?: Record<string, string>;
//   method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
//   params: Record<string, string>;
//   body: BodyInit | null;
// };

type Options = {
  API_HOST?: string;
  API_PROTOCOL?: "http" | "https";
  API_VERSION?: string;
  API_KEY?: string;
  API_PORT?: string;
  API_TIMEOUT?: number;
};

type RequiredOptions = {
  API_KEY: string;
  url: URL;
  headers: HeadersInit;
};

export class ApiClientOptions {
  private apiCalls = 0;
  readonly options: RequiredOptions;

  constructor(options: Options = {}) {
    const headers: HeadersInit = {};

    const url = new URL(
      options.API_VERSION || API_VRSION,
      `${options.API_PROTOCOL || API_PROTOCOL}://${options.API_HOST || API_HOST}/api/`,
    );
    url.port = options.API_PORT || API_PORT;

    if (options.API_KEY !== "") {
      headers["x-api-key"] = options.API_KEY ?? "";
    }

    this.options = Object.freeze({
      API_KEY: options.API_KEY?.trim() || "",
      url,
      headers,
    });
  }

  get getApiCalls() {
    return this.apiCalls;
  }
}

export const apiClientOptions = new ApiClientOptions({ API_PORT: "10105" });
