import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const artifactDir = '/Users/sourav/.gemini/antigravity/brain/d168e919-8489-4aa3-8e17-ba17ad7e68e0';
const publicDir = path.join(rootDir, 'public', 'assets', 'design-presets');

fs.mkdirSync(artifactDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const chromeBin = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const captures = [
  {
    html: path.join(__dirname, 'snapshot-blocks.html'),
    outName: 'blocks-presets-comparison.png',
    width: 1200,
    height: 780
  },
  {
    html: path.join(__dirname, 'snapshot-paddles.html'),
    outName: 'paddles-presets-comparison.png',
    width: 1200,
    height: 380
  },
  {
    html: path.join(__dirname, 'snapshot-balls.html'),
    outName: 'balls-presets-comparison.png',
    width: 1200,
    height: 840
  },
  {
    html: path.join(__dirname, 'snapshot-powerups.html'),
    outName: 'powerups-presets-comparison.png',
    width: 1200,
    height: 840
  }
];

console.log('Capturing high-resolution visual preset snapshots using headless Chrome...');

for (const item of captures) {
  const artifactDest = path.join(artifactDir, item.outName);
  const publicDest = path.join(publicDir, item.outName);

  const fileUrl = `file://${item.html}`;
  const cmd = `"${chromeBin}" --headless --disable-gpu --virtual-time-budget=2000 --hide-scrollbars --window-size=${item.width},${item.height} --screenshot="${artifactDest}" "${fileUrl}"`;

  console.log(`Rendering ${item.outName} ...`);
  execSync(cmd, { stdio: 'inherit' });

  // Copy to public folder as well
  fs.copyFileSync(artifactDest, publicDest);
  console.log(`Saved: ${artifactDest}`);
}

console.log('All visual preset snapshots successfully captured!');
