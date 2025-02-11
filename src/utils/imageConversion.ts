export function base64ToBlob(
  base64: string,
  mimeType: string,
) {
  const binaryString = atob(base64.split(",")[1]); // Remove the data URI prefix
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

export function base64ToFile(
  base64: string,
  fileName: string,
  mimeType: string,
) {
  const blob = base64ToBlob(base64, mimeType);
  return new File([blob], fileName, { type: mimeType });
}

// Function to convert an image URL to binary data
export async function imageSrcToBase64(imageSrc: string, mimeType: string) {
  const response = await fetch(imageSrc);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const binaryData = new Uint8Array(arrayBuffer);

  return uint8ArrayToBase64Image(binaryData, mimeType);
}

function uint8ArrayToBase64Image(bytes: Uint8Array, mimeType: string) {
  const binaryString = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), "");
  const base64String = btoa(binaryString);
  return `data:${mimeType};base64,${base64String}`;
}
