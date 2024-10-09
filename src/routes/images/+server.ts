import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
  const body = await event.request.formData();
  return json({
    name: body.get("name") ?? "world",
  });
};
