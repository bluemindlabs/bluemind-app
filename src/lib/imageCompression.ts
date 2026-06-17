// src/lib/imageCompression.ts
// Client-side image compression before upload to save Storage + bandwidth.

import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.8, // target ~800KB
    maxWidthOrHeight: 1600, // plenty for analysis + display
    useWebWorker: true,
    fileType: "image/jpeg" as const,
    initialQuality: 0.8,
  };
  try {
    const compressed = await imageCompression(file, options);
    // Preserve a sensible filename/extension.
    return new File([compressed], file.name.replace(/\.[^.]+$/, ".jpg"), {
      type: "image/jpeg",
    });
  } catch (e) {
    console.warn("Compression failed, using original file.", e);
    return file;
  }
}

/** Read a File as a base64 string (no data: prefix). Used for the Gemini API call. */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // strip "data:image/...;base64,"
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
