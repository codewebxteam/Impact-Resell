// src/services/imagekitService.js

export const IMAGEKIT_CONFIG = {
  publicKey: "public_dy2dH9tJBRQrEbPOQ7gZTp6xB4Y=",
  privateKey: "private_k5Tn7P+5K5RgWkwGPHk3/lWLDIM=",
  imagekitId: "0s0fb4b2b",
  urlEndpoint: "https://ik.imagekit.io/0s0fb4b2b",
  uploadEndpoint: "https://upload.imagekit.io/api/v1/files/upload",
};

/**
 * Upload an image file or base64 data to ImageKit.
 * @param {File|Blob|string} file - The file, blob, or base64 data to upload.
 * @param {string} [fileName] - Optional custom filename.
 * @param {string} [folder="/logos"] - Destination folder in ImageKit.
 * @returns {Promise<{ url: string, fileId: string, name: string }>}
 */
export const uploadToImageKit = async (file, fileName, folder = "/logos") => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const cleanName = fileName
    ? fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
    : file.name
    ? file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    : `logo_${Date.now()}.png`;

  formData.append("fileName", cleanName);
  formData.append("folder", folder);
  formData.append("useUniqueFileName", "true");

  const authHeader = "Basic " + btoa(IMAGEKIT_CONFIG.privateKey + ":");

  const response = await fetch(IMAGEKIT_CONFIG.uploadEndpoint, {
    method: "POST",
    headers: {
      Authorization: authHeader,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Upload failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson?.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return {
    url: data.url,
    fileId: data.fileId,
    name: data.name,
    filePath: data.filePath,
  };
};
