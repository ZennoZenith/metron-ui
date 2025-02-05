import { apiClientOptions } from "$lib/api-builder";
import type { ApiClientOptions } from "$lib/api-builder";
import { ApiError, CustomError, FetchError, JsonDeserializeError, ParseError, ValidationError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { type Equation, type EquationArray, validateSchema, validateSchemaArray } from "$schemas/equations/self";
import { validateUuid } from "$schemas/uuid";
import { catchError, fetchJson } from "$utils";
import { validateCreateSchema } from "../schemas/create";
import { validateSearchSchema } from "../schemas/search";
import { validateUpdateSchema } from "../schemas/update";

export class EquationApiClient {
  private readonly url: URL;
  private readonly headers: HeadersInit;

  constructor(options: ApiClientOptions = apiClientOptions) {
    this.headers = options.options.headers;
    this.url = options.options.url;
  }

  async searchByQueryTitle(
    data: unknown,
  ): Promise<Result<EquationArray, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    const parsed = validateSearchSchema(data);

    if (parsed.err) {
      return parsed;
    }

    const { search } = parsed.unwrap();
    const url = new URL("equations", this.url);
    url.searchParams.append("search", search);

    const errorOrJson = await fetchJson(url, {
      method: "GET",
      headers: {
        ...this.headers,
      },
    });

    if (errorOrJson.err) {
      return errorOrJson as Result<never, typeof errorOrJson.err>;
    }

    const maybeParseJson = validateSchemaArray(errorOrJson.unwrap());
    if (maybeParseJson.err) {
      return Err(new ParseError().fromSelf(maybeParseJson.err));
    }

    return Ok(maybeParseJson.unwrap()) as Result<EquationArray, never>;
  }

  async getById(
    id: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Equation, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    if (!validateUuid(id)) {
      return Err(new ValidationError({ id: ["Invalid id:uuid"] }, ["Invalid id:uuid"]));
    }
    const url = new URL(`equations/id/${id}`, this.url);
    const errorOrJson = await fetchJson(url, {
      method: "GET",
      headers: {
        ...this.headers,
      },
    }, extra);

    if (errorOrJson.err) {
      return errorOrJson as Result<never, typeof errorOrJson.err>;
    }

    const maybeParseJson = validateSchema(errorOrJson.unwrap());
    if (maybeParseJson.err) {
      return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
    }

    return Ok(maybeParseJson.unwrap()) as Result<Equation, never>;
  }

  async create(
    data: unknown,
  ): Promise<Result<Equation, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    const parsed = validateCreateSchema(data);
    if (parsed.err) {
      return parsed;
    }

    const equation = parsed.unwrap();
    const url = new URL("equations", this.url);
    const maybeResponse = await catchError(fetch(url, {
      method: "POST",
      body: JSON.stringify({
        ...equation,
        tags: equation.tags?.split(",") ?? null,
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

    return Ok(maybeParseJson.unwrap()) as Result<Equation, never>;
  }

  async update(
    data: unknown,
  ): Promise<Result<Equation, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    const parsed = validateUpdateSchema(data);
    if (parsed.err) {
      return parsed;
    }

    const equation = parsed.unwrap();
    const url = new URL(`equations/id/${equation.id}`, this.url);
    const maybeResponse = await catchError(fetch(url, {
      method: "PATCH",
      body: JSON.stringify({
        ...equation,
        tags: equation.tags?.split(",") ?? null,
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

    return Ok(maybeParseJson.unwrap()) as Result<Equation, never>;
  }

  async deleteById(
    id: unknown,
  ): Promise<Result<Equation, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    if (!validateUuid(id)) {
      return Err(new ValidationError({ id: ["Invalid equation id:uuid"] }, ["Invalid equation id:uuid"]));
    }
    const url = new URL(`equations/id/${id}`, this.url);
    const errorOrJson = await fetchJson(url, {
      method: "DELETE",
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

    return Ok(maybeParseJson.unwrap()) as Result<Equation, never>;
  }
}
