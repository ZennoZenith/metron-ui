import { type ApiClientOptions, apiClientOptions } from "$lib/api-builder";
import { ApiError, ApiModelError, FetchError, JsonDeserializeError, ValidationError } from "$lib/error";
import { Err, isErr, Ok, Result } from "$lib/superposition";
import { type ConceptShortArray, validateSchema, validateShortSchemaArray } from "$schemas/concepts/self";
import { validateUuid } from "$schemas/uuid";
import type { Concept } from "$type/concepts";
import { fetchApiJson } from "$utils";
import { validateCreateSchema } from "../schemas/create";
import { validateSearchSchema } from "../schemas/search";
import { validateUpdateSchema } from "../schemas/update";

export class ConceptApiClient {
  private readonly url: URL;
  private readonly headers: HeadersInit;

  constructor(options: ApiClientOptions = apiClientOptions) {
    this.headers = options.options.headers;
    this.url = options.options.url;
  }

  async searchShortsByQueryTitle(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<ConceptShortArray, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    const parsed = validateSearchSchema(data);

    if (isErr(parsed)) {
      return parsed;
    }

    const { search } = parsed.unwrap();
    const url = new URL("concepts", this.url);
    url.searchParams.append("search", search);

    const errorOrJson = await fetchApiJson(url, {
      method: "GET",
      headers: {
        ...this.headers,
      },
    }, extra);

    if (isErr(errorOrJson)) {
      return errorOrJson;
    }

    const maybeParseJson = validateShortSchemaArray(errorOrJson.unwrap());
    if (isErr(maybeParseJson)) {
      return Err(ApiModelError.fromValidationError(maybeParseJson.unwrapErr()));
    }

    return Ok(maybeParseJson.unwrap()) as Result<ConceptShortArray, never>;
  }

  async getById(
    id: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Concept, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    if (!validateUuid(id)) {
      return Err(new ValidationError({ id: ["Invalid id:uuid"] }, "Invalid id:uuid"));
    }
    const url = new URL(`concepts/id/${id}`, this.url);
    const errorOrJson = await fetchApiJson(url, {
      method: "GET",
      headers: {
        ...this.headers,
      },
    }, extra);

    if (isErr(errorOrJson)) {
      return errorOrJson;
    }

    const maybeParseJson = validateSchema(errorOrJson.unwrap());
    if (isErr(maybeParseJson)) {
      return Err(ApiModelError.fromValidationError(maybeParseJson.unwrapErr()));
    }

    return Ok(maybeParseJson.unwrap()) as Result<Concept, never>;
  }

  async create(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Concept, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    const parsed = validateCreateSchema(data);
    if (isErr(parsed)) {
      return parsed;
    }

    const concept = parsed.unwrap();
    const url = new URL("concepts", this.url);
    const errorOrJson = await fetchApiJson(url, {
      method: "POST",
      body: JSON.stringify({
        ...concept,
        tags: concept.tags?.split(",") ?? null,
        equations: concept.equations?.split(",") ?? null,
        concepts: concept.concepts?.split(",") ?? null,
        images: concept.images?.split(",") ?? null,
      }),
      headers: {
        "content-type": "application/json",
      },
    }, extra);

    if (isErr(errorOrJson)) {
      return errorOrJson;
    }

    const maybeParseJson = validateSchema(errorOrJson.unwrap());
    if (isErr(maybeParseJson)) {
      return Err(ApiModelError.fromValidationError(maybeParseJson.unwrapErr()));
    }

    return Ok(maybeParseJson.unwrap()) as Result<Concept, never>;
  }

  async update(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Concept, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    const parsed = validateUpdateSchema(data);
    if (isErr(parsed)) {
      return parsed;
    }

    const concept = parsed.unwrap();
    const url = new URL(`concepts/id/${concept.id}`, this.url);
    const errorOrJson = await fetchApiJson(url, {
      method: "POST",
      body: JSON.stringify({
        ...concept,
        tags: concept.tags?.split(",") ?? null,
        equations: concept.equations?.split(",") ?? null,
        concepts: concept.concepts?.split(",") ?? null,
        images: concept.images?.split(",") ?? null,
      }),
      headers: {
        "content-type": "application/json",
      },
    }, extra);

    if (isErr(errorOrJson)) {
      return errorOrJson;
    }

    const maybeParseJson = validateSchema(errorOrJson.unwrap());
    if (isErr(maybeParseJson)) {
      return Err(ApiModelError.fromValidationError(maybeParseJson.unwrapErr()));
    }

    return Ok(maybeParseJson.unwrap()) as Result<Concept, never>;
  }

  async deleteById(
    id: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Concept, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    if (!validateUuid(id)) {
      return Err(new ValidationError({ id: ["Invalid concept id:uuid"] }, "Invalid concept id:uuid"));
    }
    const url = new URL(`concepts/id/${id}`, this.url);
    const errorOrJson = await fetchApiJson(url, {
      method: "DELETE",
      headers: {
        ...this.headers,
      },
    }, extra);

    if (isErr(errorOrJson)) {
      return errorOrJson;
    }

    const maybeParseJson = validateSchema(errorOrJson.unwrap());
    if (isErr(maybeParseJson)) {
      return Err(ApiModelError.fromValidationError(maybeParseJson.unwrapErr()));
    }

    return Ok(maybeParseJson.unwrap()) as Result<Concept, never>;
  }
}
