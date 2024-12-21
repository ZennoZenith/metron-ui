import { API_BASE_ROUTE } from "$constants";
import type { CreateSchema } from "$features/tags/models/create";
import { type Tag, validateSchema, validateSchemaArray } from "$features/tags/models/self";
import type { UpdateSchema } from "$features/tags/models/update";
import { ApiError, FetchError, JsonDeserializeError, ParseError, ValidationError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { fetchJson } from "$utils";
import { validateUuid } from "$utils/uuid";

/**
 * Call from serverside only
 */
export async function createTag(
  tag: CreateSchema,
): Promise<Result<Tag, FetchError | ApiError | JsonDeserializeError | ParseError>> {
  let errorOrJson = await fetchJson(`${API_BASE_ROUTE}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tag),
  });

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchema(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Tag, never>;
}

/**
 * Call from serverside only
 */
export async function updateTag(tag: UpdateSchema) {
  let errorOrJson = await fetchJson(`${API_BASE_ROUTE}/tags/id/${tag.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: tag.title }),
  });

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchema(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Tag, never>;
}

/**
 * Call from serverside only
 */
export async function deleteTag(id: string) {
  const isValidUuid = validateUuid(id);
  if (!isValidUuid) {
    return Err(new ValidationError({}, ["Invalid tag id:uuid"]));
  }

  let errorOrJson = await fetchJson(`${API_BASE_ROUTE}/tags/id/${id}`, {
    method: "DELETE",
  });

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchema(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Tag, never>;
}

/**
 * Call from serverside only
 */
export async function searchTagByQueryTitle(query: string) {
  const url = new URL(`${API_BASE_ROUTE}/tags`);
  url.searchParams.append("tagName", query);
  let errorOrJson = await fetchJson(url);

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchemaArray(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Tag[], never>;
}
