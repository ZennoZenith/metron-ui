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
