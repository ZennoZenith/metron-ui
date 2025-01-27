import { API_BASE_ROUTE } from "$constants";
import type { CreateSchema } from "$features/concepts/schemas/create";
import type { UpdateSchema } from "$features/concepts/schemas/update";
import { ApiModelError, ParseError, ValidationError } from "$lib/error";
import { Err, Ok, type Result } from "$lib/superposition";
import { type Concept, type ConceptArray, validateSchema, validateShortSchemaArray } from "$schemas/concepts/self";
import { validateUuid } from "$schemas/uuid";
import { fetchJson } from "$utils";

/**
 * Call from serverside only
 */
export async function createConcept(
  concept: CreateSchema,
) {
  const errorOrJson = await fetchJson(`${API_BASE_ROUTE}/concepts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...concept,
      tags: concept.tags?.split(",") ?? null,
      equations: concept.equations?.split(",") ?? null,
      concepts: concept.concepts?.split(",") ?? null,
      images: concept.images?.split(",") ?? null,
    }),
  });

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchema(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Concept, never>;
}

/**
 * Call from serverside only
 */
export async function updateConcept(
  concept: UpdateSchema,
) {
  const errorOrJson = await fetchJson(`${API_BASE_ROUTE}/concepts/id/${concept.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...concept,
      tags: concept.tags?.split(",") ?? null,
      equations: concept.equations?.split(",") ?? null,
      concepts: concept.concepts?.split(",") ?? null,
      images: concept.images?.split(",") ?? null,
    }),
  });

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchema(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Concept, never>;
}

/**
 * Call from serverside only
 */
export async function searchConceptsByQueryTitle(query: string) {
  const url = new URL(`${API_BASE_ROUTE}/concepts`);
  url.searchParams.append("search", query);
  const errorOrJson = await fetchJson(url);

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateShortSchemaArray(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ApiModelError(maybeParseJson.unwrapErr().extra));
  }

  return Ok(maybeParseJson.unwrap()) as Result<ConceptArray, never>;
}

/**
 * Call from serverside only
 */
export async function searchConceptById(id: string) {
  const isValidUuid = validateUuid(id);
  if (!isValidUuid) {
    return Err(new ValidationError({}, ["Invalid concept id:uuid"]));
  }

  const errorOrJson = await fetchJson(`${API_BASE_ROUTE}/concepts/id/${id}`, {
    method: "GET",
  });

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchema(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Concept, never>;
}

/**
 * Call from serverside only
 */
export async function deleteConcept(id: string) {
  const isValidUuid = validateUuid(id);
  if (!isValidUuid) {
    return Err(new ValidationError({}, ["Invalid concept id:uuid"]));
  }

  const errorOrJson = await fetchJson(`${API_BASE_ROUTE}/concepts/id/${id}`, {
    method: "DELETE",
  });

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchema(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Concept, never>;
}
