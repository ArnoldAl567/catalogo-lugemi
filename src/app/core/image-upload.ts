// Compress in the administrator's browser so large originals never reach the API.
export async function prepareUploadImage(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  const image = new Image();
  try {
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const optimized = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.88));
    return optimized?.type === 'image/webp' && optimized.size < file.size ? optimized : file;
  } catch { return file; }
  finally { URL.revokeObjectURL(url); }
}
