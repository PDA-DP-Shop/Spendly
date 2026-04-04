import { Jimp } from 'jimp';
import path from 'path';

const IMG_PATH = path.resolve('public/spendly-logo.png');

async function main() {
  const image = await Jimp.read(IMG_PATH);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const size = Math.max(width, height);

  const canvas = new Jimp({
    width: size,
    height: size,
    color: 0xffffffff // white
  });

  const x = Math.floor((size - width) / 2);
  const y = Math.floor((size - height) / 2);

  canvas.composite(image, x, y);
  await canvas.write(IMG_PATH);
  console.log(`✅ Fixed logo: Centered ${width}x${height} into ${size}x${size} square.`);
}

main().catch(console.error);
