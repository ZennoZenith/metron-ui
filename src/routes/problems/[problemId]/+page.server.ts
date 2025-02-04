import ProblemApiClient from "$features/problems/api";
import type { ErrorObject } from "$lib/error";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "$utils/http-codes";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const problemClient = new ProblemApiClient();
const errorHandleFn = (message: string) => error(INTERNAL_SERVER_ERROR, { message });

export const load: PageServerLoad = async ({ params, url }) => {
  const problemId = params.problemId;
  const problem = await problemClient.getProblemById(problemId);

  if (problem.isErr()) {
    return error(NOT_FOUND, problem.unwrapErr(errorHandleFn).error as ErrorObject);
  }

  return {
    problem: problem.unwrap(errorHandleFn),
    edit: url.searchParams.get("edit") === "true",
  };
};
