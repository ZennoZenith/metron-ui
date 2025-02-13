import { CustomError } from "$lib/error";
import { Err, Ok } from "$lib/superposition";
import { search } from "$schemas";
import { flatten, object, safeParse } from "valibot";

export class SearchSchemaError extends CustomError {
  readonly issues: SearchIssues;
  constructor(issues: SearchIssues) {
    super("TagSearchSchemaError", "Invalid tag search schema");
    this.issues = issues;
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

  const issues: SearchIssues = flatten<typeof searchSchema>(d.issues)["nested"] ?? {};

  return Err(new SearchSchemaError(issues));
}

export type SearchIssues = NonNullable<ReturnType<typeof flatten<typeof searchSchema>>["nested"]>;
