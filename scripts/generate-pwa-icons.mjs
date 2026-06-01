import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'public/icons/icon.svg');
const svg = readFileSync(svgPath);

const sizes = [180, 192, 512];

for (const size of sizes) {
  const output = join(root, `public/icons/icon-${size}.png`);
  await sharp(svg).resize(size, size).png().toFile(output);
  console.log(`Generated ${output}`);
}
