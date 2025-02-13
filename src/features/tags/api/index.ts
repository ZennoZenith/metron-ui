import { type Tag, type TagArray, validateSchema, validateSchemaArray } from "$api/schemas/tags";
import { ApiClient, apiClientOptions } from "$lib/api-builder";
import type { ApiClientOptions } from "$lib/api-builder";
import { type ApiError, ApiModelError, type FetchError, type JsonDeserializeError } from "$lib/error";
import { isErr, Result } from "$lib/superposition";
import { UuidSchemaError, validateUuid } from "$schemas/uuid";
import { CreateSchemaError, validateCreateSchema } from "../schemas/create";
import { SearchSchemaError, validateSearchSchema } from "../schemas/search";
import { UpdateSchemaError, validateUpdateSchema } from "../schemas/update";

export class TagApiClient extends ApiClient {
  constructor(apiOptions: ApiClientOptions = apiClientOptions) {
    super(apiOptions);
  }

  async searchByQueryTitle(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<TagArray, SearchSchemaError | FetchError | ApiError | ApiModelError | JsonDeserializeError>> {
    const parsed = validateSearchSchema(data);

    if (isErr(parsed)) {
      return parsed;
    }

    const { search } = parsed.unwrap();
    const url = new URL("tags", this.apiClientOptions.options.url);
    url.searchParams.append("tagName", search);
    return this.apiClientOptions.fetchFromApi(url, { method: "GET" }, validateSchemaArray, extra);
  }

  async getById(
    id: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Tag, UuidSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const uuidOrError = validateUuid(id, "Invalid tag id:uuid");
    if (isErr(uuidOrError)) {
      return uuidOrError;
    }
    const uuid = uuidOrError.unwrap();
    const url = new URL(`tags/id/${uuid}`, this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(url, { method: "GET" }, validateSchema, extra);
  }

  async create(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Tag, CreateSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const parsed = validateCreateSchema(data);

    if (isErr(parsed)) {
      return parsed;
    }

    const tag = parsed.unwrap();
    const url = new URL("tags", this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(
      url,
      {
        method: "POST",
        body: JSON.stringify(tag),
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
  ): Promise<Result<Tag, UpdateSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const parsed = validateUpdateSchema(data);
    if (isErr(parsed)) {
      return parsed;
    }

    const tag = parsed.unwrap();
    const url = new URL(`tags/id/${tag.id}`, this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(
      url,
      {
        method: "PATCH",
        body: JSON.stringify(tag),
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
  ): Promise<Result<Tag, UuidSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const uuidOrError = validateUuid(id, "Invalid tag id:uuid");
    if (isErr(uuidOrError)) {
      return uuidOrError;
    }
    const uuid = uuidOrError.unwrap();
    const url = new URL(`tags/id/${uuid}`, this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(url, { method: "DELETE" }, validateSchema, extra);
  }
}
