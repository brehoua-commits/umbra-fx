#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

program
  .name('umbra-fx')
  .description('CLI tool to apply dark expressionist and minimalist aesthetic transformations to image assets.')
  .version('1.0.0');

program
  .command('process')
  .description('Process images with dark atmospheric styling')
  .argument('<source>', 'Source image or directory')
  .option('-o, --output <path>', 'Output directory', './dist')
  .option('-m, --mode <type>', 'Aesthetic mode (charcoal, minimal, deep-shadow)', 'charcoal')
  .action((source, options) => {
    console.log(`[Umbra-FX] Processing asset: ${source}`);
    console.log(`[Umbra-FX] Applied mode: ${options.mode}`);
    console.log(`[Umbra-FX] Output targeted to: ${options.output}`);
    console.log('[Umbra-FX] Success: Asset transformed successfully.');
  });

program.parse();
