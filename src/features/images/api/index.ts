import { type Image, type ImageArray, validateSchema, validateSchemaArray } from "$api/schemas/images";
import { apiClientOptions } from "$lib/api-builder";
import type { ApiClientOptions } from "$lib/api-builder";
import { ApiError, FetchError, JsonDeserializeError, ValidationError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { validateUuid } from "$schemas/uuid";
import { fetchApiJson } from "$utils";
import { validateCreateSchema } from "../schemas/create";
import { validateSearchSchema } from "../schemas/search";
import { validateUpdateSchema } from "../schemas/update";

export class ImageApiClient {
  private readonly url: URL;
  private readonly headers: HeadersInit;

  constructor(options: ApiClientOptions = apiClientOptions) {
    this.headers = options.options.headers;
    this.url = options.options.url;
  }

  async searchByQueryTitle(
    data: unknown,
  ): Promise<Result<ImageArray, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    const parsed = validateSearchSchema(data);

    if (parsed.err) {
      return parsed;
    }

    const { search } = parsed.unwrap();
    const url = new URL("images", this.url);
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

    return Ok(maybeParseJson.unwrap()) as Result<ImageArray, never>;
  }

  async getById(
    id: unknown,
    extra?: { customFetch?: typeof fetch },
  ): Promise<Result<Image, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    if (!validateUuid(id)) {
      return Err(new ValidationError({ id: ["Invalid id:uuid"] }, ["Invalid id:uuid"]));
    }
    const url = new URL(`images/id/${id}`, this.url);
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

    return Ok(maybeParseJson.unwrap()) as Result<Image, never>;
  }

  async create(
    data: unknown,
  ): Promise<Result<Image, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    const parsed = validateCreateSchema(data);
    if (parsed.err) {
      return parsed;
    }

    const image = parsed.unwrap();
    const newFormData = new FormData();
    newFormData.append("image", image.image);
    newFormData.append("title", image.title);
    if (image.description) newFormData.append("description", image.description);
    if (image.tags) newFormData.append("tags", image.tags);

    const url = new URL("images", this.url);
    const errorOrJson = await fetchJson(url, {
      method: "POST",
      body: newFormData,
      headers: {
        ...this.headers,
      },
    });

    if (errorOrJson.isErr()) {
      return Err(new JsonDeserializeError().fromError(errorOrJson.unwrapErr()));
    }

    const json = errorOrJson.unwrap();

    const maybeParseJson = validateSchema(json);
    if (maybeParseJson.err) {
      return Err(new ParseError().fromSelf(maybeParseJson.err));
    }

    return Ok(maybeParseJson.unwrap()) as Result<Image, never>;
  }

  async update(
    data: unknown,
  ): Promise<Result<Image, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    const parsed = validateUpdateSchema(data);
    if (parsed.err) {
      return parsed;
    }

    const image = parsed.unwrap();

    const newFormData = new FormData();
    newFormData.append("image", image.image);
    newFormData.append("title", image.title);
    if (image.description) newFormData.append("description", image.description);
    if (image.tags) newFormData.append("tags", image.tags);

    const url = new URL(`images/id/${image.id}`, this.url);
    const errorOrJson = await fetchJson(url, {
      method: "PATCH",
      body: newFormData,
      headers: {
        ...this.headers,
      },
    });

    if (errorOrJson.isErr()) {
      return Err(new JsonDeserializeError().fromError(errorOrJson.unwrapErr()));
    }

    const json = errorOrJson.unwrap();

    const maybeParseJson = validateSchema(json);
    if (maybeParseJson.err) {
      return Err(new ParseError().fromSelf(maybeParseJson.err));
    }

    return Ok(maybeParseJson.unwrap()) as Result<Image, never>;
  }

  async deleteById(
    id: unknown,
  ): Promise<Result<Image, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
    if (!validateUuid(id)) {
      return Err(new ValidationError({ id: ["Invalid image id:uuid"] }, ["Invalid image id:uuid"]));
    }
    const url = new URL(`images/id/${id}`, this.url);
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

    return Ok(maybeParseJson.unwrap()) as Result<Image, never>;
  }
}
