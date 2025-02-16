import { ApiError, FetchError, JsonDeserializeError, UnknowError } from "$lib/error";
import { Err, isErr, Ok, type Result } from "$lib/superposition";
import { NO_CONTENT } from "$utils/http-codes";

export async function catchError<T>(
  promise: Promise<T>,
): Promise<Result<T, UnknowError>> {
  try {
    const data = await promise;
    return Ok(data);
  } catch (error) {
    return Err(new UnknowError(error));
  }
}

// Disabled because of any type
// eslint-disable-next-line
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function catchErrorSync<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  ...args: TArgs
): Result<TReturn, UnknowError> {
  try {
    const data = fn(...args);
    return Ok(data);
  } catch (error) {
    return Err(new UnknowError(error));
  }
}

export async function fetchApiEmpty(
  url: RequestInfo | URL,
  init?: RequestInit,
  extra?: { customFetch?: typeof fetch },
): Promise<Result<"NO_CONTENT", FetchError | ApiError>> {
  const internalFetch = extra?.customFetch ? extra.customFetch : fetch;
  const maybeResponse = await catchError(internalFetch(url, init));
  if (isErr(maybeResponse)) {
    return Err(FetchError.fromUnknownError(maybeResponse.unwrapErr()));
  }

  const response = maybeResponse.unwrap();
  if (response.status === NO_CONTENT) {
    return Ok("NO_CONTENT");
  }

  const text = (await catchError(response.text())).unwrapOr("");
  // const contentType = response.headers.get("Content-Type");
  // if (contentType === "application/json") {
  //   const maybeJson = catchErrorSync(JSON.parse, text).unwrapOr(() => { error: text });
  //   return Err(new ApiError(maybeJson));
  // }
  const maybeJson = catchErrorSync(JSON.parse, text).unwrapOr(() => {
    return { message: text };
  });
  return Err(new ApiError(maybeJson));
}

export async function fetchApiJson(
  url: RequestInfo | URL,
  init: RequestInit,
  extra?: { customFetch?: typeof fetch },
): Promise<Result<Record<string, unknown>, FetchError | ApiError | JsonDeserializeError>> {
  const internalFetch = extra?.customFetch ? extra.customFetch : fetch;
  const maybeResponse = await catchError(internalFetch(url, init));
  if (isErr(maybeResponse)) {
    return Err(FetchError.fromUnknownError(maybeResponse.unwrapErr()));
  }

  const response = maybeResponse.unwrap();
  const maybeJson = await catchError<Record<string, unknown>>(response.json());
  if (isErr(maybeJson)) {
    return Err(JsonDeserializeError.fromUnknownError(maybeResponse.unwrapErr()));
  }

  const json = maybeJson.unwrap();

  if (response.status > 399) {
    return Err(new ApiError(json));
  }

  return Ok(json);
}
