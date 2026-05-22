import sharp from "sharp";

const MAX_BYTES = 1024 * 1024;
const MAX_DIMENSION = 1920;

export async function compressPropertyPhoto(input: Buffer) {
  const meta = await sharp(input).metadata();
  let width = meta.width && meta.width > MAX_DIMENSION ? MAX_DIMENSION : meta.width;
  let height = meta.height && meta.height > MAX_DIMENSION ? MAX_DIMENSION : meta.height;
  let quality = 82;

  let output = await sharp(input)
    .rotate()
    .resize(width, height, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  while (output.length > MAX_BYTES && quality > 45) {
    quality -= 8;
    output = await sharp(input)
      .rotate()
      .resize(width, height, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
  }

  while (output.length > MAX_BYTES && (width ?? MAX_DIMENSION) > 900) {
    width = Math.round((width ?? MAX_DIMENSION) * 0.85);
    height = Math.round((height ?? MAX_DIMENSION) * 0.85);
    output = await sharp(input)
      .rotate()
      .resize(width, height, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: Math.max(quality, 50), mozjpeg: true })
      .toBuffer();
  }

  if (output.length > MAX_BYTES) {
    throw new Error("Could not compress image to 1MB or less. Try a smaller photo.");
  }

  return {
    buffer: output,
    contentType: "image/jpeg" as const,
    extension: "jpg" as const
  };
}
