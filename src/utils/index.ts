import { ApiError, FetchError, JsonDeserializeError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { NO_CONTENT } from "$utils/http-codes";

export async function catchError<T, E extends Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return Ok(data);
  } catch (error) {
    return Err(error as E);
  }
}

// Disabled because of any type
// eslint-disable-next-line
export function catchErrorSync<TArgs extends any[], TReturn, E extends Error>(
  fn: (...args: TArgs) => TReturn,
  ...args: TArgs
): Result<TReturn, E> {
  try {
    const data = fn(...args);
    return Ok(data);
  } catch (error) {
    return Err(error as E);
  }
}

export async function fetchEmpty(
  url: RequestInfo | URL,
  init?: RequestInit,
): Promise<Result<0, FetchError | ApiError>> {
  const maybeResponse = await catchError(fetch(url, init));
  if (maybeResponse.err) {
    return Err(new FetchError().fromError(maybeResponse.err));
  }

  const response = maybeResponse.unwrap();
  if (response.status === NO_CONTENT) {
    return Ok(0);
  }

  const text = (await catchError(response.text())).unwrapOr(() => "");
  // const contentType = response.headers.get("Content-Type");
  // if (contentType === "application/json") {
  //   const maybeJson = catchErrorSync(JSON.parse, text).unwrapOr(() => { error: text });
  //   return Err(new ApiError(maybeJson));
  // }
  const maybeJson = catchErrorSync(JSON.parse, text).unwrapOr(() => {
    return { error: text };
  });
  return Err(new ApiError(maybeJson));
}

/**
 * Only use with backed api as it tries to convert backend api error to ApiError
 */
export async function fetchJson(
  url: RequestInfo | URL,
  init?: RequestInit,
): Promise<Result<Record<string, unknown>, FetchError | ApiError | JsonDeserializeError>> {
  const maybeResponse = await catchError(fetch(url, init));
  if (maybeResponse.err) {
    return Err(new FetchError().fromError(maybeResponse.err));
  }

  const response = maybeResponse.unwrap();
  const maybeJson = await catchError<Record<string, unknown>, Error>(response.json());
  if (maybeJson.err) {
    return Err(new JsonDeserializeError().fromError(maybeJson.err));
  }

  const json = maybeJson.unwrap();
  if (response.status > 399) {
    return Err(new ApiError(json));
  }

  return Ok(json);
}
