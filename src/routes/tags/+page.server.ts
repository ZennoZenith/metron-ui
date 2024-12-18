import { createTag, deleteTag, updateTag } from "$api/tags";
import { validateCreateSchema } from "$features/tags/models/create";
import { validateUpdateSchema } from "$features/tags/models/update";
import { type ErrorObject, ValidationError } from "$lib/error";
import { isErr } from "$lib/superposition";
import type { Tag } from "$type/tags";
import { type Superposition } from "$utils";
import { type Uuid, UuidSchema } from "$utils/uuid";
import { fail } from "@sveltejs/kit";
import { safeParse } from "valibot";
import type { Actions } from "./$types";

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const formEntries = Object.fromEntries(formData.entries());
    const reqData = validateCreateSchema(formEntries);
    if (reqData.err) {
      return fail(400, reqData.err as ErrorObject);
    }

    const data = await createTag(reqData.unwrap());

    if (isErr(data)) {
      return fail(400, data.obj.err as ErrorObject);
    }

    return data.unwrap();
  },
  // update: async ({ request }) => {
  //   const formData = await request.formData();
  //   const formEntries = Object.fromEntries(formData.entries());
  //   const reqData = validateUpdateSchema(formEntries);
  //   if (!reqData.success) {
  //     return fail(400, reqData satisfies Superposition);
  //   }

  //   const data = await updateTag(reqData.data);

  //   if (!data.success) {
  //     return fail(data.httpCode, data satisfies Superposition);
  //   }
  //   return data satisfies Superposition<{}, Tag>;
  // },
  // delete: async ({ request }) => {
  //   const formData = await request.formData();
  //   const { id } = Object.fromEntries(formData.entries());
  //   const reqData = safeParse(UuidSchema, id);
  //   if (!reqData.success) {
  //     return fail(
  //       400,
  //       {
  //         success: false,
  //         httpCode: 400,
  //         error: {
  //           type: "VALIDATION",
  //           messages: ["Validation error"],
  //           data: { id: [reqData.issues[0].message] },
  //         },
  //       } satisfies Superposition<{ id: [string] }>,
  //     );
  //   }

  //   const tagId = reqData.output as Uuid;
  //   const data = await deleteTag(tagId);

  //   if (!data.success) {
  //     return fail(data.httpCode, data satisfies Superposition);
  //   }
  //   return data satisfies Superposition<{}, Tag>;
  // },
} satisfies Actions;
