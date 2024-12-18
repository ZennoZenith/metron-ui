export type ErrorObject = Readonly<{
  message: string;
  messages: [string, ...string[]];
  type: string;
  cause: unknown;
  extra: Record<string, unknown>;
}>;

export class CustomError extends Error {
  readonly messages: [string, ...string[]];
  readonly type: string;
  readonly extra: Record<string, unknown>;

  constructor(type: string, extra?: Record<string, unknown>, messages?: [string, ...string[]]) {
    const message = messages?.[0] ?? "Default Err message";
    super(message);
    this.messages = messages ?? [message];
    this.type = type;
    this.extra = extra ?? {};
  }

  get error(): ErrorObject {
    return {
      message: this.message,
      messages: this.messages,
      type: this.type,
      cause: this.cause,
      extra: this.extra,
    } as const;
  }
}

export class ValidationError extends CustomError {
  constructor(extra: Record<string, unknown>, messages?: [string, ...string[]]) {
    super("validation-error", extra, messages ?? ["Validation Error"]);
  }
}

export class FetchError extends CustomError {
  constructor(extra: Record<string, unknown>, messages?: [string, ...string[]]) {
    super("fetch-error", extra, messages ?? ["Fetch Error"]);
  }
}

export class JsonDeserializeError extends CustomError {
  constructor(extra: Record<string, unknown>, messages?: [string, ...string[]]) {
    super("json-deserialize-error", extra, messages ?? ["Json Deserialize Error"]);
  }
}
