import { pipe, safeParse, string, uuid } from "valibot";

export const UuidSchema = pipe(string(), uuid("The UUID is badly formatted."));

export function validateUuid(value: string) {
  return safeParse(UuidSchema, value).success;
}

export type Uuid = string;
