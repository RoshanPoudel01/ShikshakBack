import { encode } from "blurhash";
import sharp from "sharp";

const generateBlurhash = async (imagePath: string) => {
  const image = await sharp(imagePath)
    .resize(32, 32)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = image;
  const blurhash = encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4,
    4
  );
  return blurhash;
};

export { generateBlurhash };
