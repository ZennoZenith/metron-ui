import { API_BASE_ROUTE } from "$constants";
import type { CreateSchema } from "$features/images/models/create";
import { type ImageArray, validateSchema, validateSchemaArray } from "$features/images/models/self";
import { type ApiError, ApiModelError, type FetchError, ParseError, ValidationError } from "$lib/error";
import { Err, Ok, type Result } from "$lib/superposition";
import type { Image } from "$type/images";
import { fetchJson } from "$utils";
import { validateUuid } from "$utils/uuid";

/**
 * Call from serverside only
 */
export async function createImage(
  image: CreateSchema,
) {
  const newFormData = new FormData();
  newFormData.append("image", image.image);
  newFormData.append("title", image.title);
  if (image.description) newFormData.append("description", image.description);
  if (image.tags) newFormData.append("tags", image.tags);

  let errorOrJson = await fetchJson(`${API_BASE_ROUTE}/images`, {
    method: "POST",
    body: newFormData,
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

/**
 * Call from serverside only
 */
export async function searchImagesByQueryTitle(query: string) {
  const url = new URL(`${API_BASE_ROUTE}/images`);
  url.searchParams.append("search", query);
  let errorOrJson = await fetchJson(url);

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchemaArray(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ApiModelError(maybeParseJson.unwrapErr().extra));
  }

  return Ok(maybeParseJson.unwrap()) as Result<ImageArray, never>;
}

/**
 * Call from serverside only
 */
export async function deleteImage(id: string) {
  const isValidUuid = validateUuid(id);
  if (!isValidUuid) {
    return Err(new ValidationError({}, ["Invalid image id:uuid"]));
  }

  const errorOrJson = await fetchJson(`${API_BASE_ROUTE}/images/id/${id}`, {
    method: "DELETE",
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
