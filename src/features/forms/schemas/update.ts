import { ValidationError } from "$lib/error";
import { Err, Ok, type Result } from "$lib/superposition";
import { content } from "$schemas";
import { uuidSchema } from "$schemas/uuid";
import { flatten, type InferOutput, nullish, object, pipe, safeParse } from "valibot";

// export class UpdateSchemaError extends ValidationError {
//   constructor(issues: UpdateIssues = {}) {
//     super(issues, "ProblemUpdateSchemaError", "Problem update schema error");
//   }
// }

// export type UpdateIssues = ReturnType<typeof flatten<typeof updateSchema>>["nested"];

// export function validateUpdateSchema(data: unknown): Result<UpdateSchema, UpdateSchemaError> {
//   const d = safeParse(updateSchema, data);
//   if (d.success) {
//     return Ok(d.output);
//   }

//   const issues: UpdateIssues = flatten<typeof updateSchema>(d.issues).nested ?? {};

//   return Err(new UpdateSchemaError(issues));
// }
