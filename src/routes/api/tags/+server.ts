import { searchTagByQueryTitle } from "$features/tags/api/server";
import { validateSearchSchema } from "$features/tags/schemas/search";
import { type ErrorObject, JsonDeserializeError } from "$lib/error";
import { catchError } from "$utils";
import { BAD_REQUEST } from "$utils/http-codes";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const maybeJson = await catchError(request.json());

  if (maybeJson.err) {
    return json(new JsonDeserializeError().fromError(maybeJson.err).error, { status: BAD_REQUEST });
  }

  const parsed = validateSearchSchema(maybeJson.unwrap());
  if (parsed.err) {
    return json(parsed.unwrapErr().error, { status: BAD_REQUEST });
  }

  const search = parsed.unwrap().search;
  const errorJson = await searchTagByQueryTitle(search);

  if (errorJson.err) {
    return json(errorJson.unwrapErr().error as ErrorObject, { status: BAD_REQUEST });
  }

  return json(errorJson.unwrap(), { status: 200 });
};
