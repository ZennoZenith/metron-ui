import { custom, type InferOutput, pipe, safeParse, string, uuid } from "valibot";

export const uuidSchema = pipe(string("Uuid must be stirng"), uuid("The Uuid is badly formatted."));

export function validateUuid(value: unknown) {
  return safeParse(uuidSchema, value).success;
}

export const uuidArrayString = pipe(
  string("Should be string"),
  custom<string>(input => {
    if (typeof input !== "string") return false;
    return input.split(",").every(v => safeParse(uuidSchema, v));
  }, "The UUID is badly formatted."),
);

export type Uuid = InferOutput<typeof uuidSchema>;
export type UuidArrayString = InferOutput<typeof uuidArrayString>;
