/**
 * Replicate Dataset Preparation & Training Automation Script
 * Prepares the 88 Coptic icons with high-precision canonical captions
 * and creates the training archive (dataset.zip) for Replicate LoRA training.
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const ICONS_DIR = path.join(__dirname, '..', 'icons');
const OUTPUT_ZIP = path.join(__dirname, '..', 'scratch', 'coptic_icons_dataset.zip');
const SCRATCH_DIR = path.join(__dirname, '..', 'scratch');

if (!fs.existsSync(SCRATCH_DIR)) {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
}

// Master trigger word for Replicate LoRA training
const TRIGGER_WORD = 'coptic_icon_style';

// Master canonical caption templates for the Coptic training set
const BASE_CAPTION = `${TRIGGER_WORD}, authentic traditional 2D Coptic Orthodox icon, Isaac Fanous neo-coptic school, egg tempera on gesso wood board, large watchful almond-shaped spiritual eyes, flat gold leaf halo with inscribed Coptic cross, clean bold geometric graphic outlines, sacred liturgical vestments, clear ancient Coptic lettering, holy reverent Eastern Christian iconography.`;

async function prepareDataset() {
  console.log('1. Reading icons directory...');
  const files = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  console.log(`Found ${files.length} icon images.`);

  const output = fs.createWriteStream(OUTPUT_ZIP);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`\n✅ Dataset zip created successfully!`);
    console.log(`Path: ${OUTPUT_ZIP}`);
    console.log(`Total bytes: ${archive.pointer()} bytes`);
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imagePath = path.join(ICONS_DIR, file);
    const baseName = path.parse(file).name;
    const ext = path.parse(file).ext;

    // Standardized pair name: e.g. coptic_icon_001.jpg and coptic_icon_001.txt
    const targetImgName = `coptic_icon_${String(i + 1).padStart(3, '0')}${ext}`;
    const targetTxtName = `coptic_icon_${String(i + 1).padStart(3, '0')}.txt`;

    // Add image file to zip
    archive.file(imagePath, { name: targetImgName });

    // Generate corresponding high-precision text caption
    const textCaption = `${BASE_CAPTION}, canonical Coptic sacred composition number ${i + 1}.`;
    archive.append(textCaption, { name: targetTxtName });
  }

  await archive.finalize();
}

prepareDataset().catch(console.error);
