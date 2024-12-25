import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { search } from "$schemas";
import { flatten, object, safeParse } from "valibot";

const searchSchema = object(
  {
    search: search(),
  },
  "Should be an object",
);

export function validateSearchSchema(data: unknown) {
  const d = safeParse(searchSchema, data);
  if (d.success) {
    return Ok(d.output);
  }

  const issues: SearchIssues = flatten<typeof searchSchema>(d.issues)["nested"] ?? {};

  return Err(new ValidationError(issues));
}

export type SearchIssues = ReturnType<typeof flatten<typeof searchSchema>>["nested"];
