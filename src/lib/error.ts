import type { InternalApiError, Taged } from "$type";
import { array, literal, minLength, object, optional, pipe, record, safeParse, string, union, unknown } from "valibot";

const errorType = [
  "generic-error",
  "validation-error",
  "fetch-error",
  "json-deserialize-error",
  "api-error",
  "parse-error",
  "api-model-error",
] as const;

export type ErrorType = typeof errorType[number];

export type ErrorObject = Readonly<{
  success: false;
  message: string;
  messages: [string, ...string[]];
  type: ErrorType;
  cause: unknown;
  extra: Record<string, unknown>;
}>;

function stringToNumber(value: unknown) {
  const n = Number(value);
  return isNaN(n) ? null : n;
}

function constructApiError(err?: unknown): InternalApiError {
  if (typeof err !== "object" || err === null) {
    return {
      error: "-1",
      errorCode: -1,
      href: "",
      httpCode: 418,
      title: "",
    } satisfies InternalApiError;
  }
  const obj: Partial<InternalApiError> = {};
  if ("error" in err) obj.error = err?.error?.toString();
  if ("errorCode" in err) stringToNumber(err?.errorCode);
  if ("href" in err) err?.href?.toString();
  if ("httpCode" in err) stringToNumber(err?.httpCode);
  if ("title" in err) err?.title?.toString();

  return {
    error: obj.error ?? "-1",
    errorCode: obj.errorCode ?? -1,
    href: obj.href ?? "",
    httpCode: obj.httpCode ?? 418,
    title: obj.title ?? "",
  } satisfies InternalApiError;
}

const errorSchema = pipe(
  object(
    {
      success: literal(false, "success should be boolean false"),
      type: union(
        errorType.map(v => literal(v)),
        "invalid error type",
      ),
      message: string("message should be string"),
      name: optional(string("name should be string")),
      cause: optional(unknown()),
      messages: pipe(
        array(
          string("messages should be string"),
          "messages should be an array of string",
        ),
        minLength(1, "messages array should atleast contain one element of string"),
      ),
      extra: record(
        string("extra object key shoud be string"),
        unknown(),
        "extra must by of type Record<string, unknown>",
      ),
    },
  ),
);

export class CustomError extends Error implements Taged {
  readonly _tag: string;
  readonly success = false;
  readonly type: ErrorType;
  messages: [string, ...string[]];
  extra: Record<string, unknown>;

  constructor(type: ErrorType, extra?: Record<string, unknown>, messages?: [string, ...string[]]) {
    const message = messages?.[0] ?? "Default Err message";
    super(message);
    this._tag = type;
    this.messages = messages ?? [message];
    this.type = type;
    this.extra = extra ?? {};
  }

  fromError(error: Error, extra?: Record<string, unknown>, messages?: [string, ...string[]]) {
    this.cause = error.cause;
    this.message = error.message;
    this.name = error.name;
    this.stack = error.stack;
    this.messages = messages ?? [this.message];
    this.extra = extra ?? {};
    return this;
  }

  fromSelf(error: CustomError) {
    this.cause = error.cause;
    this.message = error.message;
    this.name = error.name;
    this.stack = error.stack;
    this.messages = error.messages;
    this.extra = error.extra;
    return this;
  }

  static parseError(value: unknown) {
    const d = safeParse(errorSchema, value);
    if (!d.success) {
      return new ParseError(undefined, ["Unable to parse error schema"]);
    }
    const { type, extra, messages, cause, name } = d.output;
    const customError = new CustomError(type, extra, messages as [string, ...string[]]);
    customError.cause = cause;
    customError.name = name ?? "";
    return customError;
  }

  get error(): ErrorObject {
    return {
      success: this.success,
      type: this.type,
      message: this.message,
      messages: this.messages,
      cause: this.cause,
      extra: this.extra,
    } as const;
  }
}

export class GenericError extends CustomError {
  constructor(extra?: Record<string, unknown>, messages?: [string, ...string[]]) {
    super("generic-error", extra, messages ?? ["Generic Error"]);
  }
}

export class ValidationError extends CustomError {
  constructor(extra?: Record<string, unknown>, messages?: [string, ...string[]]) {
    super("validation-error", extra, messages ?? ["Validation Error"]);
  }
}

export class FetchError extends CustomError {
  constructor(extra?: Record<string, unknown>, messages?: [string, ...string[]]) {
    super("fetch-error", extra, messages ?? ["Fetch Error"]);
  }
}

export class JsonDeserializeError extends CustomError {
  constructor(extra?: Record<string, unknown>, messages?: [string, ...string[]]) {
    super("json-deserialize-error", extra, messages ?? ["Json Deserialize Error"]);
  }
}

export class ApiError extends CustomError {
  constructor(extra?: Record<string, unknown>, messages?: [string, ...string[]]) {
    const apiError = constructApiError(extra);
    super("api-error", apiError, messages ?? [apiError.error]);
  }
}

/**
 * DEPRECATED use ApiModelError instead
 * Parse error shoud only thrown when backend and frontend schema are out of sync
 */
export class ParseError extends CustomError {
  constructor(extra?: Record<string, unknown>, messages?: [string, ...string[]]) {
    super("parse-error", extra, messages ?? ["Api Error"]);
  }
}

/**
 * Parse error shoud only thrown when api backend and svelte backend schema are out of sync
 */
export class ApiModelError extends CustomError {
  constructor(extra?: Record<string, unknown>, messages?: [string, ...string[]]) {
    super("api-model-error", extra, messages ?? ["Api Model Error"]);
  }
}
