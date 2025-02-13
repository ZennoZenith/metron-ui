import { type Concept, type ConceptShortArray, validateSchema, validateShortSchemaArray } from "$api/schemas/concepts";
import { apiClientOptions } from "$lib/api-builder";
import type { ApiClientOptions } from "$lib/api-builder";
import { ApiError, ApiModelError, FetchError, JsonDeserializeError } from "$lib/error";
import { isErr, Result } from "$lib/superposition";
import { UuidSchemaError, validateUuid } from "$schemas/uuid";
import { CreateSchemaError, validateCreateSchema } from "../schemas/create";
import { SearchSchemaError, validateSearchSchema } from "../schemas/search";
import { UpdateSchemaError, validateUpdateSchema } from "../schemas/update";

export class ConceptApiClient {
  private readonly apiClientOptions: ApiClientOptions;

  constructor(apiOptions: ApiClientOptions = apiClientOptions) {
    this.apiClientOptions = apiOptions;
  }

  async searchShortsByQueryTitle(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<
    Result<ConceptShortArray, SearchSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>
  > {
    const parsed = validateSearchSchema(data);

    if (isErr(parsed)) {
      return parsed;
    }

    const { search } = parsed.unwrap();
    const url = new URL("concepts", this.apiClientOptions.options.url);
    url.searchParams.append("search", search);

    return this.apiClientOptions.fetchFromApi(url, { method: "GET" }, validateShortSchemaArray, extra);
  }

  async getById(
    id: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Concept, UuidSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const uuidOrError = validateUuid(id, "Invalid concept id:uuid");
    if (isErr(uuidOrError)) {
      return uuidOrError;
    }
    const uuid = uuidOrError.unwrap();
    const url = new URL(`concepts/id/${uuid}`, this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(url, { method: "GET" }, validateSchema, extra);
  }

  async create(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Concept, CreateSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const parsed = validateCreateSchema(data);
    if (isErr(parsed)) {
      return parsed;
    }

    const concept = parsed.unwrap();
    const url = new URL("concepts", this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(
      url,
      {
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
      },
      validateSchema,
      extra,
    );
  }

  async update(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Concept, UpdateSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const parsed = validateUpdateSchema(data);
    if (isErr(parsed)) {
      return parsed;
    }

    const concept = parsed.unwrap();
    const url = new URL(`concepts/id/${concept.id}`, this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(
      url,
      {
        method: "PATCH",
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
      },
      validateSchema,
      extra,
    );
  }

  async deleteById(
    id: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Concept, UuidSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const uuidOrError = validateUuid(id, "Invalid concept id:uuid");
    if (isErr(uuidOrError)) {
      return uuidOrError;
    }
    const uuid = uuidOrError.unwrap();
    const url = new URL(`concepts/id/${uuid}`, this.apiClientOptions.options.url);

    return this.apiClientOptions.fetchFromApi(url, { method: "DELETE" }, validateSchema, extra);
  }
}
