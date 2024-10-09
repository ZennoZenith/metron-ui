import { API_BASE_ROUTE } from "$lib";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

interface Err extends Record<string, any> {
  error: {
    title?: {
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
    const file = formData.get("file");
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

    // File {name: 'Screenshot from 2024-08-18 23-26-19.png', lastModified: 1724003779513, lastModifiedDate: Sun Aug 18 2024 23:26:19 GMT+0530 (India Standard Time), webkitRelativePath: '', size: 108653, …}
    // lastModified :  1724003779513
    // lastModifiedDate :  Sun Aug 18 2024 23:26:19 GMT+0530 (India Standard Time) {}
    // name :  "Screenshot from 2024-08-18 23-26-19.png"
    // size :  108653
    // type :  "image/png"
    if (!file) {
      return fail<Err>(422, {
        error: {
          title: {
            message: "File is undefined or empty",
          },
        },
      });
    }

    const obj = {
      title,
      description,
      tags,
    };
    const objJson = JSON.stringify(obj);

    const meta = new Blob([objJson], {
      type: "application/json",
    });

    const newFormData = new FormData();

    newFormData.append("file", file);
    newFormData.append("meta", meta);

    let res = await fetch(`${API_BASE_ROUTE}/images`, {
      method: "POST",
      body: newFormData,
    });

    /// status code 204 = NO CONTENT
    if (res.status !== 204) {
      let body = await res.json();
      console.log(body);
      return fail<Err>(422, {
        error: {
          title: {
            message: `Image create error`,
          },
        },
        data: body,
      });
    }

    return { success: true } as Ok;
  },
} satisfies Actions;
