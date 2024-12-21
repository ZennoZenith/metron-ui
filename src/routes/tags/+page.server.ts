import { createTag, deleteTag, updateTag } from "$features/tags/api/server";
import { validateCreateSchema } from "$features/tags/models/create";
import { validateUpdateSchema } from "$features/tags/models/update";
import { type ErrorObject } from "$lib/error";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "$utils/http-codes";
import { error, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

const errorHandleFn = (message: string) => error(INTERNAL_SERVER_ERROR, { message });

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const formEntries = Object.fromEntries(formData.entries());
    const reqData = validateCreateSchema(formEntries);
    if (reqData.err) {
      return fail(BAD_REQUEST, reqData.unwrapErr(errorHandleFn).error as ErrorObject);
    }

    const data = await createTag(reqData.unwrap(errorHandleFn));

    if (data.err) {
      return fail(
        BAD_REQUEST,
        data.unwrapErr(errorHandleFn).error as ErrorObject,
      );
    }

    return data.unwrap(errorHandleFn);
  },
  update: async ({ request }) => {
    const formData = await request.formData();
    const formEntries = Object.fromEntries(formData.entries());
    const reqData = validateUpdateSchema(formEntries);
    if (reqData.err) {
      return fail(BAD_REQUEST, reqData.unwrapErr(errorHandleFn).error as ErrorObject);
    }

    const data = await updateTag(reqData.unwrap(errorHandleFn));

    if (data.err) {
      return fail(
        BAD_REQUEST,
        data.unwrapErr(errorHandleFn).error as ErrorObject,
      );
    }

    return data.unwrap(errorHandleFn);
  },
  delete: async ({ request }) => {
    const formData = await request.formData();
    const { id } = Object.fromEntries(formData.entries());
    const data = await deleteTag(id.toString());

    if (data.err) {
      return fail(BAD_REQUEST, data.unwrapErr(errorHandleFn).error as ErrorObject);
    }

    return data.unwrap(errorHandleFn);
  },
} satisfies Actions;
