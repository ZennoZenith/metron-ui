import { apiClientOptions } from "$lib/api-builder";
import type { ApiClientOptions } from "$lib/api-builder";
import { ApiError, CustomError, FetchError, JsonDeserializeError, ParseError, ValidationError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { type Problem, validateSchema } from "$schemas/problems/self";
import { validateUuid } from "$schemas/uuid";
import { catchError, fetchJson } from "$utils";
import { validateCreateSchema } from "../schemas/create";

export default class ApiClient {
  private readonly url: URL;
  private readonly headers: HeadersInit;

  constructor(options: ApiClientOptions = apiClientOptions) {
    this.headers = options.options.headers;
    this.url = options.options.url;
  }

  async getProblemById(
    id: unknown,
  ): Promise<Result<Problem, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
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

  async createProblem(
    data: unknown,
  ): Promise<Result<Problem, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    const parsed = validateCreateSchema(data);
    if (parsed.err) {
      return parsed;
    }

    const problem = parsed.unwrap();
    const url = new URL(`problems`, this.url);
    const maybeResponse = await catchError(fetch(url, {
      method: "POST",
      body: JSON.stringify({
        ...problem,
        tags: problem.tags?.split(",") ?? null,
        equations: problem.equations?.split(",") ?? null,
        concepts: problem.concepts?.split(",") ?? null,
        images: problem.images?.split(",") ?? null,
        problems: problem.problems?.split(",") ?? null,
      }),
      headers: {
        "content-type": "application/json",
      },
    }));

    if (maybeResponse.isErr()) {
      return Err(new FetchError().fromError(maybeResponse.unwrapErr()));
    }

    const response = maybeResponse.unwrap();
    const maybeJson = await catchError<Record<string, unknown>, Error>(response.json());

    if (maybeJson.err) {
      return Err(new JsonDeserializeError().fromError(maybeJson.err));
    }

    const json = maybeJson.unwrap();
    if (response.status > 399) {
      return Err(CustomError.parseError(json));
    }

    const maybeParseJson = validateSchema(json);
    if (maybeParseJson.err) {
      return Err(new ParseError().fromSelf(maybeParseJson.err));
    }

    return Ok(maybeParseJson.unwrap()) as Result<Problem, never>;
  }
}
