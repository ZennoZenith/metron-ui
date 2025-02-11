import { ImageApiClient } from "$features/images/api";
import type { ErrorObject } from "$lib/error";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "$utils/http-codes";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

const imageClient = new ImageApiClient();
const errorHandleFn = (message: string) => error(INTERNAL_SERVER_ERROR, { message });

export const load: PageLoad = async ({ params, url }) => {
  const imageId = params.imageId;
  const image = await imageClient.getById(imageId);

  if (image.isErr()) {
    return error(NOT_FOUND, image.unwrapErr(errorHandleFn).error as ErrorObject);
  }

  const img = image.unwrap(errorHandleFn);
  return {
    image: img,
    edit: url.searchParams.get("edit") === "true",
  };
};
