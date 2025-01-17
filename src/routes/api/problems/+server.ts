import { createProblem, searchProblemsByQueryTitle } from "$features/problems/api/server";
import { validateCreateSchema } from "$features/problems/schemas/create";
import { validateSearchSchema } from "$features/problems/schemas/search";
import { type ErrorObject, JsonDeserializeError } from "$lib/error";
import { catchError } from "$utils";
import { BAD_REQUEST } from "$utils/http-codes";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, url }) => {
  if (url.search === "?/create") {
    return await create(request);
  }
  // if (url.search === "?/update") {
  //   return await update(request);
  // }
  if (url.search === "?/search") {
    return await search(request);
  }
  return error(404, "Not found, Method now available");
};

async function search(request: Request) {
  const maybeJson = await catchError(request.json());

  if (maybeJson.err) {
    return json(new JsonDeserializeError().fromError(maybeJson.err).error, { status: BAD_REQUEST });
  }

  const parsed = validateSearchSchema(maybeJson.unwrap());
  if (parsed.err) {
    return json(parsed.unwrapErr().error, { status: BAD_REQUEST });
  }

  const search = parsed.unwrap().search;
  const errorJson = await searchProblemsByQueryTitle(search);

  if (errorJson.err) {
    return json(errorJson.unwrapErr().error as ErrorObject, { status: BAD_REQUEST });
  }

  return json(errorJson.unwrap(), { status: 200 });
}

async function create(request: Request) {
  const maybeJson = await catchError(request.json());

  if (maybeJson.err) {
    return json(new JsonDeserializeError().fromError(maybeJson.err).error, { status: BAD_REQUEST });
  }

  const parsed = validateCreateSchema(maybeJson.unwrap());
  if (parsed.err) {
    return json(parsed.unwrapErr().error, { status: BAD_REQUEST });
  }

  const errorJson = await createProblem(parsed.unwrap());

  if (errorJson.err) {
    return json(errorJson.unwrapErr().error as ErrorObject, { status: BAD_REQUEST });
  }

  return json(errorJson.unwrap(), { status: 200 });
}
