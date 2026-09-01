import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const ICONS_DIR = path.resolve('./icons');
const TEMP_DIR = path.resolve('./dataset_temp');
const ZIP_OUTPUT = path.resolve('./public/coptic_icons_dataset.zip');

if (fs.existsSync(TEMP_DIR)) {
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TEMP_DIR, { recursive: true });

const BASE_CAPTION = 'coptic_icon_style, authentic traditional 2D Coptic Orthodox icon, Isaac Fanous neo-coptic school, egg tempera on gesso wood board, large watchful almond-shaped spiritual eyes, flat gold leaf halo with inscribed Coptic cross, clean bold geometric graphic outlines, sacred liturgical vestments, clear ancient Coptic lettering, holy reverent Eastern Christian iconography.';

const files = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

console.log(`Processing ${files.length} icon files...`);

files.forEach((file, index) => {
  const ext = path.extname(file);
  const num = String(index + 1).padStart(3, '0');
  const imgDest = path.join(TEMP_DIR, `coptic_icon_${num}${ext}`);
  const txtDest = path.join(TEMP_DIR, `coptic_icon_${num}.txt`);

  fs.copyFileSync(path.join(ICONS_DIR, file), imgDest);
  fs.writeFileSync(txtDest, `${BASE_CAPTION} canonical Coptic sacred icon composition number ${index + 1}.`, 'utf8');
});

if (fs.existsSync(ZIP_OUTPUT)) {
  fs.unlinkSync(ZIP_OUTPUT);
}

// Compress using PowerShell Compress-Archive
const psArgs = [
  '-Command',
  'Compress-Archive',
  '-Path',
  `${TEMP_DIR}${path.sep}*`,
  '-DestinationPath',
  ZIP_OUTPUT,
  '-Force'
];
execFileSync('powershell', psArgs, { stdio: 'inherit' });

fs.rmSync(TEMP_DIR, { recursive: true, force: true });

const stats = fs.statSync(ZIP_OUTPUT);
console.log(`\n🎉 Successfully generated training dataset zip!`);
console.log(`File: ${ZIP_OUTPUT}`);
console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
console.log(`Total paired files (images + txt): ${files.length * 2}`);
