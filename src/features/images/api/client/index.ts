import { validateSearchSchema } from "$features/images/models/search";
import { ApiError, CustomError, FetchError, JsonDeserializeError, ParseError, ValidationError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { type ImageArray, validateSchemaArray } from "$schemas/images/self";
import { catchError } from "$utils";

export async function searchImage(
  data: unknown,
): Promise<Result<ImageArray, ValidationError | FetchError | ApiError | JsonDeserializeError>> {
  const parsed = validateSearchSchema(data);
  if (parsed.err) {
    return parsed;
  }

  const search = parsed.unwrap();
  const maybeResponse = await catchError(fetch("/api/images", {
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

  const maybeParseJson = validateSchemaArray(json);
  if (maybeParseJson.err) {
    return Err(new ParseError().fromSelf(maybeParseJson.err));
  }

  return Ok(maybeParseJson.unwrap()) as Result<ImageArray, never>;
}
