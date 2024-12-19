import { createImage } from "$features/images/api/server";
import { validateCreateSchema } from "$features/images/models/create";
import type { ErrorObject } from "$lib/error";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "$utils/http-codes";
import { error, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

const errorHandleFn = (message: string) => error(INTERNAL_SERVER_ERROR, { message });

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const formEntries = Object.fromEntries(formData.entries());
    const reqData = validateCreateSchema(formEntries);
    if (reqData.isErr()) {
      return fail(BAD_REQUEST, reqData.unwrapErr(errorHandleFn).error as ErrorObject);
    }
    const data = await createImage(reqData.unwrap(errorHandleFn));

    if (data.isErr()) {
      return fail(
        BAD_REQUEST,
        data.unwrapErr(errorHandleFn).error as ErrorObject,
      );
    }

    /**
     * Code below is commented because for some reason when returning empty object correct return type is not set
     */
    // return data.unwrap(errorHandleFn);
    return { success: true };
  },
} satisfies Actions;
