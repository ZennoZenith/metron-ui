import { validateCreateSchema } from "$features/problems/schemas/create";
import { validateSearchSchema } from "$features/problems/schemas/search";
import { ApiError, CustomError, FetchError, JsonDeserializeError, ParseError, ValidationError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { type ProblemShortArray, validateSchema, validateShortSchemaArray } from "$schemas/problems/self";
import type { Problem } from "$type/problems";
import { catchError } from "$utils";

export async function searchProblem(
  data: unknown,
): Promise<Result<ProblemShortArray, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
  const parsed = validateSearchSchema(data);
  if (parsed.err) {
    return parsed;
  }

  const search = parsed.unwrap();
  const maybeResponse = await catchError(fetch("/api/problems?/search", {
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

  return Ok(maybeParseJson.unwrap()) as Result<ProblemShortArray, never>;
}

export async function createProblem(
  data: unknown,
): Promise<Result<Problem, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
  const parsed = validateCreateSchema(data);
  if (parsed.err) {
    return parsed;
  }

  const maybeResponse = await catchError(fetch("/api/problems?/create", {
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

  return Ok(maybeParseJson.unwrap()) as Result<Problem, never>;
}
