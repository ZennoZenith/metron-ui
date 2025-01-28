import { API_HOST, API_PORT, API_PROTOCOL, API_VRSION } from "$constants";
import HealthCheck from "./health-check";

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

export type RequiredOptions = {
  API_KEY: string;
  url: URL;
  headers: HeadersInit;
};

export class ApiClient {
  private apiCalls = 0;
  // readonly trains: Trains;
  readonly healthCheck: HealthCheck;
  readonly headers: HeadersInit;
  private readonly options: RequiredOptions;

  constructor(options: Options = {}) {
    this.headers = {};

    const url = new URL(
      options.API_VERSION || API_VRSION,
      `${options.API_PROTOCOL || API_PROTOCOL}://${options.API_HOST || API_HOST}/api/`,
    );
    url.port = options.API_PORT || API_PORT;

    if (options.API_KEY !== "") {
      this.headers["x-api-key"] = options.API_KEY ?? "";
    }

    this.options = Object.freeze({
      API_KEY: options.API_KEY?.trim() || "",
      url,
      headers: this.headers,
    });
    this.healthCheck = new HealthCheck(this.options);
    // this.trains = new Trains(this);
  }

  get getApiCalls() {
    return this.apiCalls;
  }

  // log() {
  //   console.log(this.options);
  // }
}
