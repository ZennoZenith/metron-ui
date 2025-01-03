import { deleteConcept } from "$features/concepts/api/server";
import { type ErrorObject } from "$lib/error";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "$utils/http-codes";
import { error, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

const errorHandleFn = (message: string) => error(INTERNAL_SERVER_ERROR, { message });

export const actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const { id } = Object.fromEntries(formData.entries());
    const data = await deleteConcept(id.toString());

    if (data.isErr()) {
      return fail(BAD_REQUEST, data.unwrapErr(errorHandleFn).error as ErrorObject);
    }

    return data.unwrap(errorHandleFn);
  },
} satisfies Actions;
