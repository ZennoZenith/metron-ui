import { createTag, deleteTag, updateTag } from "$features/tags/api/server";
import { validateCreateSchema } from "$features/tags/models/create";
import { validateUpdateSchema } from "$features/tags/models/update";
import { type ErrorObject, ValidationError } from "$lib/error";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "$utils/http-codes";
import { type Uuid, UuidSchema } from "$utils/uuid";
import { error, fail, redirect } from "@sveltejs/kit";
import { flatten, safeParse } from "valibot";
import type { Actions } from "./$types";

const errorHandleFn = (message: string) => error(500, { message });

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
  // update: async ({ request }) => {
  //   const formData = await request.formData();
  //   const formEntries = Object.fromEntries(formData.entries());
  //   const reqData = validateUpdateSchema(formEntries);
  //   if (reqData.err) {
  //     return fail(BAD_REQUEST, reqData.err as ErrorObject);
  //   }

  //   const data = await updateTag(reqData.unwrap());

  //   if (data.err) {
  //     return fail(BAD_REQUEST, data.unwrapErr() as ErrorObject);
  //   }

  //   return data.unwrap();
  // },

  // delete: async ({ request }) => {
  //   const formData = await request.formData();
  //   const { id } = Object.fromEntries(formData.entries());
  //   const reqData = safeParse(UuidSchema, id);
  //   if (!reqData.success) {
  //     return fail(
  //       BAD_REQUEST,
  //       new ValidationError(
  //         flatten<typeof UuidSchema>(reqData.issues)["nested"] ?? {},
  //       ).error as ErrorObject,
  //     );
  //   }

  //   const tagId = reqData.output as Uuid;
  //   const data = await deleteTag(tagId);

  //   if (data.err) {
  //     return fail(BAD_REQUEST, data.unwrapErr() as ErrorObject);
  //   }

  //   return data.unwrap();
  // },
} satisfies Actions;
