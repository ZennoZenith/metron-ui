import { pipe, safeParse, string, uuid } from "valibot";

export const uuidSchema = (message: string = "The Uuid is badly formatted.") =>
  pipe(string("Uuid must be stirng"), uuid(message));

export function validateUuid(value: string) {
  return safeParse(uuidSchema(), value).success;
}

export type Uuid = string;
