import { type Equation, type EquationArray, validateSchema, validateSchemaArray } from "$api/schemas/equations";
import type { SearchSchemaError } from "$features/tags/schemas/search";
import { ApiClient, apiClientOptions } from "$lib/api-builder";
import type { ApiClientOptions } from "$lib/api-builder";
import type { ApiError, ApiModelError, FetchError, JsonDeserializeError } from "$lib/error";
import { isErr, type Result } from "$lib/superposition";
import { type UuidSchemaError, validateUuid } from "$schemas/uuid";
import { type CreateSchemaError, validateCreateSchema } from "../schemas/create";
import { validateSearchSchema } from "../schemas/search";
import { type UpdateSchemaError, validateUpdateSchema } from "../schemas/update";

export class EquationApiClient extends ApiClient {
  constructor(options: ApiClientOptions = apiClientOptions) {
    super(options);
  }

  async searchByQueryTitle(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<EquationArray, SearchSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const parsed = validateSearchSchema(data);

    if (isErr(parsed)) {
      return parsed;
    }

    const { search } = parsed.unwrap();
    const url = new URL("equations", this.apiClientOptions.options.url);
    url.searchParams.append("search", search);

    return this.apiClientOptions.fetchFromApi(url, { method: "GET" }, validateSchemaArray, extra);
  }

  async getById(
    id: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Equation, UuidSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const uuidOrError = validateUuid(id, "Invalid equation id:uuid");
    if (isErr(uuidOrError)) {
      return uuidOrError;
    }
    const uuid = uuidOrError.unwrap();
    const url = new URL(`equations/id/${uuid}`, this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(url, { method: "GET" }, validateSchema, extra);
  }

  async create(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Equation, CreateSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const parsed = validateCreateSchema(data);
    if (isErr(parsed)) {
      return parsed;
    }

    const equation = parsed.unwrap();
    const url = new URL("equations", this.apiClientOptions.options.url);

    return this.apiClientOptions.fetchFromApi(
      url,
      {
        method: "POST",
        body: JSON.stringify({
          ...equation,
          tags: equation.tags?.split(",") ?? null,
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
  ): Promise<Result<Equation, UpdateSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const parsed = validateUpdateSchema(data);
    if (isErr(parsed)) {
      return parsed;
    }

    const equation = parsed.unwrap();
    const url = new URL(`equations/id/${equation.id}`, this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(
      url,
      {
        method: "PATCH",
        body: JSON.stringify({
          ...equation,
          tags: equation.tags?.split(",") ?? null,
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
  ): Promise<Result<Equation, UuidSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const uuidOrError = validateUuid(id, "Invalid equation id:uuid");
    if (isErr(uuidOrError)) {
      return uuidOrError;
    }
    const url = new URL(`equations/id/${id}`, this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(url, { method: "DELETE" }, validateSchema, extra);
  }
}
