import { EquationApiClient } from "$features/equations/api";
import type { ErrorObject } from "$lib/error";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "$utils/http-codes";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const equationClient = new EquationApiClient();
const errorHandleFn = (message: string) => error(INTERNAL_SERVER_ERROR, { message });

export const load: PageServerLoad = async ({ params, url }) => {
  const equationId = params.equationId;
  const equation = await equationClient.getById(equationId);

  if (equation.isErr()) {
    return error(NOT_FOUND, equation.unwrapErr(errorHandleFn).error as ErrorObject);
  }

  return {
    equation: equation.unwrap(errorHandleFn),
    edit: url.searchParams.get("edit") === "true",
  };
};
