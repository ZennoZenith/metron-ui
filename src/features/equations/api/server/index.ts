import { API_BASE_ROUTE } from "$constants";
import type { CreateSchema } from "$features/equations/models/create";
import {
  type Equation,
  type EquationArray,
  validateSchema,
  validateSchemaArray,
} from "$features/equations/models/self";
import type { UpdateSchema } from "$features/equations/models/update";
import { ApiModelError, ParseError, ValidationError } from "$lib/error";
import { Err, Ok, type Result } from "$lib/superposition";
import { fetchJson } from "$utils";
import { validateUuid } from "$utils/uuid";

/**
 * Call from serverside only
 */
export async function createEquation(
  equation: CreateSchema,
) {
  let errorOrJson = await fetchJson(`${API_BASE_ROUTE}/equations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(equation),
  });

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchema(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Equation, never>;
}

/**
 * Call from serverside only
 */
export async function updateEquation(
  equation: UpdateSchema,
) {
  let errorOrJson = await fetchJson(`${API_BASE_ROUTE}/equations/id/${equation.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(equation),
  });

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchema(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Equation, never>;
}

/**
 * Call from serverside only
 */
export async function searchEquationsByQueryTitle(query: string) {
  const url = new URL(`${API_BASE_ROUTE}/equations`);
  url.searchParams.append("search", query);
  let errorOrJson = await fetchJson(url);

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchemaArray(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ApiModelError(maybeParseJson.unwrapErr().extra));
  }

  return Ok(maybeParseJson.unwrap()) as Result<EquationArray, never>;
}

/**
 * Call from serverside only
 */
export async function searchEquationById(id: string) {
  const isValidUuid = validateUuid(id);
  if (!isValidUuid) {
    return Err(new ValidationError({}, ["Invalid equation id:uuid"]));
  }

  const errorOrJson = await fetchJson(`${API_BASE_ROUTE}/equations/id/${id}`, {
    method: "GET",
  });

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchema(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Equation, never>;
}

/**
 * Call from serverside only
 */
export async function deleteEquation(id: string) {
  const isValidUuid = validateUuid(id);
  if (!isValidUuid) {
    return Err(new ValidationError({}, ["Invalid equation id:uuid"]));
  }

  const errorOrJson = await fetchJson(`${API_BASE_ROUTE}/equations/id/${id}`, {
    method: "DELETE",
  });

  if (errorOrJson.err) {
    return errorOrJson as Result<never, typeof errorOrJson.err>;
  }

  const maybeParseJson = validateSchema(errorOrJson.unwrap());
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.unwrapErr()));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Equation, never>;
}
