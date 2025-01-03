import { validateCreateSchema } from "$features/concepts/schemas/create";
import { validateSearchSchema } from "$features/concepts/schemas/search";
import { validateUpdateSchema } from "$features/concepts/schemas/update";
import { ApiError, CustomError, FetchError, JsonDeserializeError, ParseError, ValidationError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { type ConceptShortArray, validateSchema, validateShortSchemaArray } from "$schemas/concepts/self";
import type { Concept } from "$type/concepts";
import { catchError } from "$utils";

export async function searchConcept(
  data: unknown,
): Promise<Result<ConceptShortArray, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
  const parsed = validateSearchSchema(data);
  if (parsed.err) {
    return parsed;
  }

  const search = parsed.unwrap();
  const maybeResponse = await catchError(fetch("/api/concepts?/search", {
    method: "POST",
    body: JSON.stringify(search),
    headers: {
      "content-type": "application/json",
    },
  }));
  if (maybeResponse.isErr()) {
    return Err(new FetchError().fromError(maybeResponse.unwrapErr()));
  }

  const response = maybeResponse.unwrap();
  const maybeJson = await catchError<Record<string, unknown>, Error>(response.json());

  if (maybeJson.err) {
    return Err(new JsonDeserializeError().fromError(maybeJson.err));
  }

  const json = maybeJson.unwrap();
  if (response.status > 399) {
    return Err(CustomError.parseError(json));
  }

  const maybeParseJson = validateShortSchemaArray(json);
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.err));
  }

  return Ok(maybeParseJson.unwrap()) as Result<ConceptShortArray, never>;
}

export async function createConcept(
  data: unknown,
): Promise<Result<Concept, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
  console.log(data);
  const parsed = validateCreateSchema(data);
  if (parsed.err) {
    return parsed;
  }

  const maybeResponse = await catchError(fetch("/api/concepts?/create", {
    method: "POST",
    body: JSON.stringify(parsed.unwrap()),
    headers: {
      "content-type": "application/json",
    },
  }));

  if (maybeResponse.isErr()) {
    return Err(new FetchError().fromError(maybeResponse.unwrapErr()));
  }

  const response = maybeResponse.unwrap();
  const maybeJson = await catchError<Record<string, unknown>, Error>(response.json());

  if (maybeJson.err) {
    return Err(new JsonDeserializeError().fromError(maybeJson.err));
  }

  const json = maybeJson.unwrap();
  if (response.status > 399) {
    return Err(CustomError.parseError(json));
  }

  const maybeParseJson = validateSchema(json);
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.err));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Concept, never>;
}

export async function updateConcept(
  data: unknown,
): Promise<Result<Concept, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
  console.log(data);
  const parsed = validateUpdateSchema(data);
  if (parsed.err) {
    return parsed;
  }

  const maybeResponse = await catchError(fetch("/api/concepts?/update", {
    method: "POST",
    body: JSON.stringify(parsed.unwrap()),
    headers: {
      "content-type": "application/json",
    },
  }));

  if (maybeResponse.isErr()) {
    return Err(new FetchError().fromError(maybeResponse.unwrapErr()));
  }

  const response = maybeResponse.unwrap();
  const maybeJson = await catchError<Record<string, unknown>, Error>(response.json());

  if (maybeJson.err) {
    return Err(new JsonDeserializeError().fromError(maybeJson.err));
  }

  const json = maybeJson.unwrap();
  if (response.status > 399) {
    return Err(CustomError.parseError(json));
  }

  const maybeParseJson = validateSchema(json);
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.err));
  }

  return Ok(maybeParseJson.unwrap()) as Result<Concept, never>;
}
