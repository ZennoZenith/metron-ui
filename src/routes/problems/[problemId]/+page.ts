import { ProblemApiClient } from "$features/problems/api";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "$utils/http-codes";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

const problemClient = new ProblemApiClient();
const errorHandleFn = (message: string) => error(INTERNAL_SERVER_ERROR, { message });

export const load: PageLoad = async ({ params, url, fetch }) => {
  const problemId = params.problemId;
  const problem = await problemClient.getById(problemId, { customFetch: fetch });

  if (problem.isErr()) {
    return error(NOT_FOUND, problem.unwrapErr(errorHandleFn).message);
  }

  return {
    problem: problem.unwrap(errorHandleFn),
    edit: url.searchParams.get("edit") === "true",
  };
};
