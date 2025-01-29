import type { ApiClientOptions } from "$lib/api-builder";
import { ParseError, ValidationError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { type Problem, validateSchema } from "$schemas/problems/self";
import { validateUuid } from "$schemas/uuid";
import { fetchJson } from "$utils";

export default class ApiClient {
  private readonly url: URL;
  private readonly headers: HeadersInit;

  constructor(options: ApiClientOptions) {
    this.headers = options.options.headers;
    this.url = options.options.url;
  }

  async getProblemById(id: unknown) {
    if (!validateUuid(id)) {
      return Err(new ValidationError({ id: ["Invalid uuid"] }, ["Invalid uuid"]));
    }
    const url = new URL(`problems/id/${id}`, this.url);
    const errorOrJson = await fetchJson(url, {
      method: "GET",
      headers: {
        ...this.headers,
      },
    });

    if (errorOrJson.err) {
      return errorOrJson as Result<never, typeof errorOrJson.err>;
    }

    const maybeParseJson = validateSchema(errorOrJson.unwrap());
    if (maybeParseJson.err) {
      return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
    }

    return Ok(maybeParseJson.unwrap()) as Result<Problem, never>;
  }
}
