import { EquationApiClient } from "$features/equations/api";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "$utils/http-codes";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

const equationClient = new EquationApiClient();
const errorHandleFn = (message: string) => error(INTERNAL_SERVER_ERROR, { message });

export const load: PageLoad = async ({ params, url }) => {
  const equationId = params.equationId;
  const equation = await equationClient.getById(equationId);

  if (equation.isErr()) {
    return error(NOT_FOUND, equation.unwrapErr(errorHandleFn).message);
  }

  return {
    equation: equation.unwrap(errorHandleFn),
    edit: url.searchParams.get("edit") === "true",
  };
};
