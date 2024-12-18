import { searchTagByQueryTitle } from "$api/tags";
import { validateSearchSchema } from "$features/tags/models/search";
import { catchError, type Superposition } from "$utils";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const j = await catchError<{ search?: string }>(request.json());

  if (j[0]) {
    return json(
      {
        success: false,
        httpCode: 400,
        error: { type: "GENERIC", messages: ["Invalid JSON"] },
      } satisfies Superposition,
      { status: 400 },
    );
  }

  const parsed = validateSearchSchema(j[1]);

  if (!parsed.success) {
    return json(
      parsed,
      { status: parsed.httpCode },
    );
  }

  const search = parsed.data.search;

  const errorJson = await searchTagByQueryTitle(search);

  return json(errorJson, { status: errorJson.success === false ? errorJson.httpCode : 200 });
};
