#!/usr/bin/env node

const { Command } = require('commander');
const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const program = new Command();

program
  .name('umbra-fx')
  .description('Minimalist and dark aesthetic image processing CLI')
  .version('1.0.0');

function clamp(v) {
  return Math.max(0, Math.min(255, v));
}

// Fusain : niveaux de gris + contraste renforcé + grain léger
async function applyCharcoal(image) {
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    let v = (gray - 128) * 1.45 + 128;
    v += (Math.random() - 0.5) * 12;
    v = clamp(v);
    this.bitmap.data[idx] = v;
    this.bitmap.data[idx + 1] = v;
    this.bitmap.data[idx + 2] = v;
  });
  return image;
}

// Ombres profondes : courbe gamma qui écrase les tons bas/moyens
async function applyDeepShadow(image) {
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    for (let c = 0; c < 3; c++) {
      let v = this.bitmap.data[idx + c] / 255;
      v = Math.pow(v, 1.8);
      this.bitmap.data[idx + c] = clamp(v * 255 * 0.9);
    }
  });
  return image;
}

// Mélancolie : désaturation partielle + teinte bleu-gris + vignette
async function applyMelancholy(image) {
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  image.scan(0, 0, w, h, function (x, y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    let nr = gray * 0.6 + r * 0.4 - 10;
    let ng = gray * 0.6 + g * 0.4;
    let nb = gray * 0.6 + b * 0.4 + 15;

    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist;
    const vignette = 1 - dist * 0.5;

    this.bitmap.data[idx] = clamp(nr * vignette);
    this.bitmap.data[idx + 1] = clamp(ng * vignette);
    this.bitmap.data[idx + 2] = clamp(nb * vignette);
  });
  return image;
}

program
  .command('process <file>')
  .description('Traiter une image avec un effet dark expressionist')
  .option('-m, --mode <type>', 'Mode esthétique (charcoal, deep-shadow, melancholy)', 'charcoal')
  .option('-o, --output <path>', 'Dossier de destination', './dist')
  .action(async (file, options) => {
    try {
      if (!fs.existsSync(file)) {
        console.error(`[Umbra-FX] Erreur : fichier introuvable -> ${file}`);
        process.exit(1);
      }

      console.log(`[Umbra-FX] Traitement du fichier : ${file}`);
      console.log(`[Umbra-FX] Mode appliqué : ${options.mode}`);

      const image = await Jimp.read(file);

      switch (options.mode) {
        case 'charcoal':
          await applyCharcoal(image);
          break;
        case 'deep-shadow':
          await applyDeepShadow(image);
          break;
        case 'melancholy':
          await applyMelancholy(image);
          break;
        default:
          console.error(`[Umbra-FX] Mode inconnu : ${options.mode}`);
          console.error('Modes disponibles : charcoal, deep-shadow, melancholy');
          process.exit(1);
      }

      if (!fs.existsSync(options.output)) {
        fs.mkdirSync(options.output, { recursive: true });
      }

      const ext = path.extname(file) || '.png';
      const baseName = path.basename(file, ext);
      const outputPath = path.join(options.output, `${baseName}-${options.mode}${ext}`);

      await image.write(outputPath);

      console.log(`[Umbra-FX] Résultat exporté vers : ${outputPath}`);
    } catch (err) {
      console.error(`[Umbra-FX] Erreur pendant le traitement : ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
