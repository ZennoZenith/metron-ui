import { searchConceptById } from "$features/concepts/api/server";
import type { ErrorObject } from "$lib/error";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "$utils/http-codes";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const errorHandleFn = (message: string) => error(INTERNAL_SERVER_ERROR, { message });

export const load: PageServerLoad = async ({ params, url }) => {
  const conceptId = params.conceptId;
  const concept = await searchConceptById(conceptId);

  if (concept.isErr()) {
    return error(NOT_FOUND, concept.unwrapErr(errorHandleFn).error as ErrorObject);
  }

  return {
    concept: concept.unwrap(errorHandleFn),
    edit: url.searchParams.get("edit") === "true",
  };
};
