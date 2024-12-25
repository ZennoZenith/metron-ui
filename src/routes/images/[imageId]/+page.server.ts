import { IMAGE_BASE_ROUTE } from "$constants";
import { searchImageById } from "$features/images/api/server";
import type { ErrorObject } from "$lib/error";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "$utils/http-codes";
import { MimeTypes } from "$utils/mime";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const errorHandleFn = (message: string) => error(INTERNAL_SERVER_ERROR, { message });

export const load: PageServerLoad = async ({ params, url }) => {
  const imageId = params.imageId;
  const image = await searchImageById(imageId);

  if (image.isErr()) {
    return error(NOT_FOUND, image.unwrapErr(errorHandleFn).error as ErrorObject);
  }

  const img = image.unwrap(errorHandleFn);
  const imageType = MimeTypes.get(img.imageType.toLowerCase()) ?? "";
  return {
    image: img,
    edit: url.searchParams.get("edit") === "true",
    imageSrc: await imageSrcToBinary(img.fileLocation.replace("file://", IMAGE_BASE_ROUTE), imageType),
    imageType,
  };
};

// Function to convert an image URL to binary data
async function imageSrcToBinary(imageSrc: string, mimeType: string) {
  // try {
  const response = await fetch(imageSrc);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const binaryData = new Uint8Array(arrayBuffer);

  return uint8ArrayToBase64Image(binaryData, mimeType);
  // } catch (error) {
  //   console.error("Error:", error);
  //   return "";
  // }
}

function uint8ArrayToBase64Image(bytes: Uint8Array, mimeType: string) {
  const binaryString = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), "");
  const base64String = btoa(binaryString);
  return `data:${mimeType};base64,${base64String}`;
}
