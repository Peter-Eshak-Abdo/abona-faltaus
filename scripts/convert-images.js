import sharp from 'sharp';
import { readdirSync } from 'fs';
import { join } from 'path';

const dir = join(__dirname, '..', 'public', 'images'); // عدّل المسار لو يلزم

readdirSync(dir).forEach(file => {
  const full = join(dir, file);
  if (!/\.(jpe?g|png)$/i.test(file)) return;
  const name = file.replace(/\.(jpe?g|png)$/i, '');
  // webp
  sharp(full).resize(1200).webp({ quality: 80 }).toFile(join(dir, `${name}.webp`));
  // avif
  sharp(full).resize(1200).avif({ quality: 60 }).toFile(join(dir, `${name}.avif`));
});
