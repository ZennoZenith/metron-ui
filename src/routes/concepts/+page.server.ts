import { createEquation, deleteEquation, updateEquation } from "$features/equations/api/server";
import { validateCreateSchema } from "$features/equations/schemas/create";
import { validateUpdateSchema } from "$features/equations/schemas/update";
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
    const data = await createEquation(reqData.unwrap(errorHandleFn));

    if (data.isErr()) {
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
    if (reqData.isErr()) {
      return fail(BAD_REQUEST, reqData.unwrapErr(errorHandleFn).error as ErrorObject);
    }
    const data = await updateEquation(reqData.unwrap(errorHandleFn));

    if (data.isErr()) {
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
    const data = await deleteEquation(id.toString());

    if (data.isErr()) {
      return fail(BAD_REQUEST, data.unwrapErr(errorHandleFn).error as ErrorObject);
    }

    return data.unwrap(errorHandleFn);
  },
} satisfies Actions;
