import { createTag, deleteTag, updateTag } from "$lib/backend/tags";
import { type Tag, validateCreateSchema, validateUpdateSchema } from "$lib/models/tags";
import { type Uuid, UuidSchema } from "$types";
import { type Superposition } from "$utils";
import { fail } from "@sveltejs/kit";
import { safeParse } from "valibot";
import type { Actions } from "./$types";

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const formEntries = Object.fromEntries(formData.entries());
    const reqData = validateCreateSchema(formEntries);
    if (!reqData.success) {
      return fail(400, reqData satisfies Superposition);
    }

    const data = await createTag(reqData.data);

    if (!data.success) {
      return fail(data.httpCode, data satisfies Superposition);
    }
    return data satisfies Superposition<{}, Tag>;
  },
  update: async ({ request }) => {
    const formData = await request.formData();
    const formEntries = Object.fromEntries(formData.entries());
    const reqData = validateUpdateSchema(formEntries);
    if (!reqData.success) {
      return fail(400, reqData satisfies Superposition);
    }

    const data = await updateTag(reqData.data);

    if (!data.success) {
      return fail(data.httpCode, data satisfies Superposition);
    }
    return data satisfies Superposition<{}, Tag>;
  },
  delete: async ({ request }) => {
    const formData = await request.formData();
    const { id } = Object.fromEntries(formData.entries());
    const reqData = safeParse(UuidSchema, id);
    if (!reqData.success) {
      return fail(
        400,
        {
          success: false,
          httpCode: 400,
          error: {
            type: "VALIDATION",
            messages: ["Validation error"],
            data: { id: [reqData.issues[0].message] },
          },
        } satisfies Superposition<{ id: [string] }>,
      );
    }

    const tagId = reqData.output as Uuid;
    const data = await deleteTag(tagId);

    if (!data.success) {
      return fail(data.httpCode, data satisfies Superposition);
    }
    return data satisfies Superposition<{}, Tag>;
  },
} satisfies Actions;
