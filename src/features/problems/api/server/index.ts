import { API_BASE_ROUTE } from "$constants";
import type { CreateSchema } from "$features/problems/schemas/create";
import { ApiModelError, ParseError, ValidationError } from "$lib/error";
import { Err, Ok, type Result } from "$lib/superposition";
import { type Problem, type ProblemArray, validateSchema, validateShortSchemaArray } from "$schemas/problems/self";
import { validateUuid } from "$schemas/uuid";
import { fetchJson } from "$utils";

/**
 * Call from serverside only
 */
export async function createProblem(
  problem: CreateSchema,
) {
  const errorOrJson = await fetchJson(`${API_BASE_ROUTE}/problems`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...problem,
      tags: problem.tags?.split(",") ?? null,
      equations: problem.equations?.split(",") ?? null,
      concepts: problem.concepts?.split(",") ?? null,
      images: problem.images?.split(",") ?? null,
      problems: problem.problems?.split(",") ?? null,
    }),
  });

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchema(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Problem, never>;
}

/**
 * Call from serverside only
 */
export async function searchProblemsByQueryTitle(query: string) {
  const url = new URL(`${API_BASE_ROUTE}/problems`);
  url.searchParams.append("search", query);
  const errorOrJson = await fetchJson(url);

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateShortSchemaArray(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ApiModelError(maybeParseJson.unwrapErr().extra));
  }

  return Ok(maybeParseJson.unwrap()) as Result<ProblemArray, never>;
}

/**
 * Call from serverside only
 */
export async function deleteProblem(id: string) {
  const isValidUuid = validateUuid(id);
  if (!isValidUuid) {
    return Err(new ValidationError({}, ["Invalid problem id:uuid"]));
  }

  const errorOrJson = await fetchJson(`${API_BASE_ROUTE}/problems/id/${id}`, {
    method: "DELETE",
  });

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchema(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Problem, never>;
}
