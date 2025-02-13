import { apiClientOptions } from "$lib/api-builder";
import type { ApiClientOptions } from "$lib/api-builder";
import { type ApiError, ApiModelError, type FetchError, type JsonDeserializeError, ValidationError } from "$lib/error";
import { Err, isErr, Result } from "$lib/superposition";
import { type Tag, type TagArray, validateSchema, validateSchemaArray } from "$schemas/tags/self";
import { validateUuid } from "$schemas/uuid";
import { fetchApiJson } from "$utils";
import { validateCreateSchema } from "../schemas/create";
import { SearchSchemaError, validateSearchSchema } from "../schemas/search";
import { validateUpdateSchema } from "../schemas/update";

export class TagApiClient {
  private readonly url: URL;
  private readonly headers: HeadersInit;

  constructor(options: ApiClientOptions = apiClientOptions) {
    this.headers = options.options.headers;
    this.url = options.options.url;
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
    const url = new URL("tags", this.url);
    url.searchParams.append("tagName", search);

    const errorOrJson = await fetchApiJson(url, {
      method: "GET",
      headers: {
        ...this.headers,
      },
    }, extra);

    if (isErr(errorOrJson)) {
      return errorOrJson;
    }

    const maybeParseJson = validateSchemaArray(errorOrJson.unwrap());
    if (isErr(maybeParseJson)) {
      return Err(ApiModelError.fromValidationError(maybeParseJson.unwrapErr()));
    }

    return maybeParseJson as Result<TagArray, never>;
  }

  async getById(
    id: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Tag, ValidationError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    if (!validateUuid(id)) {
      return Err(new ValidationError({ id: ["Invalid id:uuid"] }, "Invalid id:uuid"));
    }
    const url = new URL(`tags/id/${id}`, this.url);
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

    return maybeParseJson as Result<Tag, never>;
  }

  async create(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Tag, ValidationError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const parsed = validateCreateSchema(data);

    if (isErr(parsed)) {
      return parsed;
    }

    const tag = parsed.unwrap();
    const url = new URL("tags", this.url);
    const errorOrJson = await fetchApiJson(url, {
      method: "POST",
      body: JSON.stringify(tag),
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

    return maybeParseJson as Result<Tag, never>;
  }

  async update(
    data: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Tag, ValidationError | FetchError | ApiError | JsonDeserializeError | ApiModelError>> {
    const parsed = validateUpdateSchema(data);
    if (isErr(parsed)) {
      return parsed;
    }

    const tag = parsed.unwrap();
    const url = new URL(`tags/id/${tag.id}`, this.url);
    const errorOrJson = await fetchApiJson(url, {
      method: "PATCH",
      body: JSON.stringify(tag),
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

    return maybeParseJson as Result<Tag, never>;
  }

  async deleteById(
    id: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Tag, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    if (!validateUuid(id)) {
      return Err(new ValidationError({ id: ["Invalid tag id:uuid"] }, "Invalid tag id:uuid"));
    }
    const url = new URL(`tags/id/${id}`, this.url);
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

    return maybeParseJson as Result<Tag, never>;
  }
}
