import { searchImageById } from "$features/images/api/server";
import type { ErrorObject } from "$lib/error";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "$utils/http-codes";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const errorHandleFn = (message: string) => error(INTERNAL_SERVER_ERROR, { message });

export const load: PageServerLoad = async ({ params }) => {
  let imageId = params.imageId;
  const image = await searchImageById(imageId);

  if (image.isErr()) {
    return error(NOT_FOUND, image.unwrapErr(errorHandleFn).error as ErrorObject);
  }

  return image.unwrap(errorHandleFn);
};
