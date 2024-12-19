import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { flatten, object, pipe, safeParse, string, trim } from "valibot";

const searchSchema = pipe(
  object(
    {
      search: pipe(
        string("search should be string"),
        trim(),
      ),
    },
  ),
);

export function validateSearchSchema(data: unknown) {
  const d = safeParse(searchSchema, data);
  if (d.success) {
    return Ok(d.output);
  }

  const issues = flatten<typeof searchSchema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}
