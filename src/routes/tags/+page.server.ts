import { createTag } from "$lib/backend/tags";
import { type Tag, validateSchema } from "$lib/models/tags";
import { type Superposition } from "$utils";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const formEntries = Object.fromEntries(formData.entries());
    const reqData = validateSchema(formEntries);
    if (!reqData.success) {
      return fail(400, reqData satisfies Superposition);
    }

    const data = await createTag(reqData.data);

    if (!data.success) {
      return fail(data.httpCode, data satisfies Superposition);
    }
    return data satisfies Superposition<{}, Tag>;
  },
} satisfies Actions;
