import { ConceptApiClient } from "$features/concepts/api";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "$utils/http-codes";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

const conceptClient = new ConceptApiClient();
const errorHandleFn = (message: string) => error(INTERNAL_SERVER_ERROR, { message });

export const load: PageLoad = async ({ params, url }) => {
  const conceptId = params.conceptId;
  const concept = await conceptClient.getById(conceptId);

  if (concept.isErr()) {
    return error(NOT_FOUND, concept.unwrapErr(errorHandleFn).message);
  }

  return {
    concept: concept.unwrap(errorHandleFn),
    edit: url.searchParams.get("edit") === "true",
  };
};
