import type { ApiClientOptions, RequiredOptions } from "$lib/api-builder";
import { ValidationError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { validateUuid } from "$schemas/uuid";
import { fetchJson } from "$utils";

export default class ApiClient {
  private readonly url: URL;
  private readonly headers: HeadersInit;

  constructor(options: ApiClientOptions) {
    this.headers = options.options.headers;
    this.url = options.options.url;
  }

  async getImageById(id: string) {
    if (!validateUuid(id)) {
      return Err(new ValidationError({ id: ["Invalid uuid"] }, ["Invalid uuid"]));
    }
    const url = new URL(`images/id/${id}`, this.url);
    const errorOrJson = await fetchJson(url, {
      method: "GET",
      headers: {
        ...this.headers,
      },
    });

    if (errorOrJson.err) {
      return errorOrJson as Result<never, typeof errorOrJson.err>;
    }

    console.log(url);
    console.log(errorOrJson);

    return Ok(errorOrJson.unwrap()) as Result<{ success: "OK" }, never>;
  }
}
