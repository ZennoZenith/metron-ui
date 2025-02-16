import { type Image, type ImageArray, validateSchema, validateSchemaArray } from "$api/schemas/images";
import { ApiClient, apiClientOptions } from "$lib/api-builder";
import type { ApiClientOptions } from "$lib/api-builder";
import type { ApiError, ApiModelError, FetchError, JsonDeserializeError } from "$lib/error";
import { isErr, type Result } from "$lib/superposition";
import { type UuidSchemaError, validateUuid } from "$schemas/uuid";
import { type CreateSchemaError, validateCreateSchema } from "../schemas/create";
import { type SearchSchemaError, validateSearchSchema } from "../schemas/search";
import { type UpdateSchemaError, validateUpdateSchema } from "../schemas/update";

export class ImageApiClient extends ApiClient {
  constructor(options: ApiClientOptions = apiClientOptions) {
    super(options);
  }

  async searchByQueryTitle(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<ImageArray, SearchSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const parsed = validateSearchSchema(data);

    if (isErr(parsed)) {
      return parsed;
    }

    const { search } = parsed.unwrap();
    const url = new URL("images", this.apiClientOptions.options.url);
    url.searchParams.append("search", search);
    return this.apiClientOptions.fetchFromApi(url, { method: "GET" }, validateSchemaArray, extra);
  }

  async getById(
    id: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Image, UuidSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const uuidOrError = validateUuid(id, "Invalid concept id:uuid");
    if (isErr(uuidOrError)) {
      return uuidOrError;
    }
    const uuid = uuidOrError.unwrap();
    const url = new URL(`images/id/${uuid}`, this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(url, { method: "GET" }, validateSchema, extra);
  }

  async create(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Image, CreateSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const parsed = validateCreateSchema(data);
    if (isErr(parsed)) {
      return parsed;
    }

    const image = parsed.unwrap();
    const newFormData = new FormData();
    newFormData.append("image", image.image);
    newFormData.append("title", image.title);
    if (image.description) newFormData.append("description", image.description);
    if (image.tags) newFormData.append("tags", image.tags);

    const url = new URL("images", this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(url, { method: "POST", body: newFormData }, validateSchema, extra);
  }

  async update(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Image, UpdateSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const parsed = validateUpdateSchema(data);
    if (isErr(parsed)) {
      return parsed;
    }

    const image = parsed.unwrap();

    const newFormData = new FormData();
    newFormData.append("image", image.image);
    newFormData.append("title", image.title);
    if (image.description) newFormData.append("description", image.description);
    if (image.tags) newFormData.append("tags", image.tags);

    const url = new URL(`images/id/${image.id}`, this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(url, { method: "PATCH", body: newFormData }, validateSchema, extra);
  }

  async deleteById(
    id: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Image, UuidSchemaError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const uuidOrError = validateUuid(id, "Invalid concept id:uuid");
    if (isErr(uuidOrError)) {
      return uuidOrError;
    }
    const uuid = uuidOrError.unwrap();
    const url = new URL(`images/id/${uuid}`, this.apiClientOptions.options.url);
    return this.apiClientOptions.fetchFromApi(url, { method: "DELETE" }, validateSchema, extra);
  }
}
