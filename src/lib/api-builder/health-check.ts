import { Ok, Result } from "$lib/superposition";
import { fetchJson } from "$utils";
import type { RequiredOptions } from ".";

export default class HealthCheck {
  private readonly url: URL;
  private readonly headers: HeadersInit;

  constructor(options: RequiredOptions) {
    this.headers = options.headers;
    this.url = options.url;
  }

  async healthCheck() {
    const healthCheckUrl = new URL("health_check", this.url);
    const errorOrJson = await fetchJson(healthCheckUrl, {
      method: "GET",
      headers: {
        ...this.headers,
      },
    });

    if (errorOrJson.err) {
      return errorOrJson as Result<never, typeof errorOrJson.err>;
    }

    return Ok(errorOrJson.unwrap()) as Result<{ success: "OK" }, never>;
  }
}
