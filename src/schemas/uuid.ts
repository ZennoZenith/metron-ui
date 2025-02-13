import { ValidationError } from "$lib/error";
import { Err, Ok, Result } from "$lib/superposition";
import { custom, flatten, type InferOutput, pipe, safeParse, string, uuid } from "valibot";

export class UuidSchemaError extends ValidationError {
  constructor(issues: UuidIssues, message: string) {
    super(issues, "UuidSchemaError", message);
  }
}

export const uuidSchema = pipe(string("Uuid must be stirng"), uuid("The Uuid is badly formatted."));

export const uuidArrayString = pipe(
  string("Should be string"),
  custom<string>(input => {
    if (typeof input !== "string") return false;
    return input.split(",").every(v => safeParse(uuidSchema, v));
  }, "The UUID is badly formatted."),
);

export function validateUuid(data: unknown, message: string): Result<Uuid, UuidSchemaError> {
  const d = safeParse(uuidSchema, data);
  if (d.success) {
    return Ok(d.output);
  }

  const issues: UuidIssues = { id: flatten<typeof uuidSchema>(d.issues)["root"] ?? ["Invalid uuid"] };

  return Err(new UuidSchemaError(issues, message));
}

export type UuidIssues = { id: NonNullable<ReturnType<typeof flatten<typeof uuidSchema>>["root"]> };
export type Uuid = InferOutput<typeof uuidSchema>;
export type UuidArrayString = InferOutput<typeof uuidArrayString>;
