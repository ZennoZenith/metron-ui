import { ValidationError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { search } from "$schemas";
import { flatten, object, safeParse } from "valibot";

export class SearchSchemaError extends ValidationError {
  constructor(issues: SearchIssues) {
    super(issues, "ImageSearchSchemaError", "Invalid image search schema");
  }
}

const searchSchema = object(
  {
    search,
  },
  "Should be an object",
);

export function validateSearchSchema(data: unknown) {
  const d = safeParse(searchSchema, data);
  if (d.success) {
    return Ok(d.output);
  }

  const issues: SearchIssues = flatten<typeof searchSchema>(d.issues).nested ?? {};

  return Err(new SearchSchemaError(issues));
}

export type SearchIssues = NonNullable<ReturnType<typeof flatten<typeof searchSchema>>["nested"]>;
