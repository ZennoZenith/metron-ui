import { searchImagesByQueryTitle } from "$features/images/api/server";
import { validateSearchSchema } from "$features/images/models/search";
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
  const errorOrJson = await searchImagesByQueryTitle(search);

  if (errorOrJson.err) {
    return json(errorOrJson.unwrapErr().error as ErrorObject, { status: BAD_REQUEST });
  }

  return json(errorOrJson.unwrap(), { status: 200 });
};
