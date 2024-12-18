import { API_BASE_ROUTE } from "$lib";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

interface Err extends Record<string, any> {
  error: {
    title?: {
      message: string;
    };
    description?: {
      message: string;
    };
    content?: {
      message: string;
    };
  };
  // data?: Tag;
}

interface Ok extends Partial<Err> {
  // data: Tag;
}

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || null;
    const tags = formData.getAll("tags").map(v => v.toString());
    const content = formData.get("content")?.toString().trim();
    // const title = formData.get("title")?.toString().trim();

    // TODO: validation logic
    if (!title || !title?.trim()) {
      return fail<Err>(422, {
        error: {
          title: {
            message: "Title is undefined or empty",
          },
        },
      });
    }

    if (!content || !content?.trim()) {
      return fail<Err>(422, {
        error: {
          content: {
            message: "Content is undefined or empty",
          },
        },
      });
    }

    const body = JSON.stringify({
      title,
      description,
      content,
      tags,
    });

    let res = await fetch(`${API_BASE_ROUTE}/equations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (res.status !== 200) {
      let body = await res.json();
      console.log(body);
      return fail<Err>(422, {
        error: {
          title: {
            message: `Equation create error`,
          },
        },
        data: body,
      });
    }

    return { success: true } as Ok;
  },
} satisfies Actions;
