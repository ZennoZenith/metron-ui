import ProblemApiClient from "$features/problems/api";
import { apiClientOptions } from "$lib/api-builder";
import type { ErrorObject } from "$lib/error";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "$utils/http-codes";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const problemClient = new ProblemApiClient(apiClientOptions);
const errorHandleFn = (message: string) => error(INTERNAL_SERVER_ERROR, { message });

export const load: PageServerLoad = async () => {
  const problemId = "19be8b0c-dac4-11ef-9c71-a3db6c213676";
  const problem = await problemClient.getProblemById(problemId);

  if (problem.isErr()) {
    return error(NOT_FOUND, problem.unwrapErr(errorHandleFn).error as ErrorObject);
  }

  return {
    problem: problem.unwrap(errorHandleFn),
  };
};
