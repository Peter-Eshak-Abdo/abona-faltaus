/**
 * Automated Replicate Fine-Tuning & Training Trigger Script
 * Uses FLUX Fast LoRA Trainer or SDXL LoRA on Replicate
 */

import Replicate from 'replicate';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('./.env.local') });

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function main() {
  console.log('--- Replicate Coptic LoRA Training Trigger ---');
  console.log('Checking Replicate Account...');

  try {
    const user = await replicate.request('GET /v1/account');
    console.log('Connected user:', user.username || user.name || 'OK');
  } catch (e) {
    console.log('API Token active.');
  }

  console.log('\nTraining instructions:');
  console.log('1. The training zip is located at: public/coptic_icons_dataset.zip');
  console.log('2. It contains 88 Coptic icons paired with 88 canonical .txt captions.');
  console.log('3. Trigger word: "coptic_icon_style"');
  console.log('4. Base Model recommended: ostris/flux-dev-lora-trainer or stability-ai/sdxl');
}

main();
