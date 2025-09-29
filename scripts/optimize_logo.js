const sharp = require('sharp');
const fs = require('fs');
const inPath = 'public/brand/nextyou-logo.png';
const backup = 'public/brand/nextyou-logo.original.png';
const outPath = inPath;
(async () => {
  if (!fs.existsSync(inPath)) return console.error('input not found');
  if (!fs.existsSync(backup)) fs.copyFileSync(inPath, backup);
  await sharp(inPath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 80 })
    .toFile(outPath + '.tmp');
  fs.renameSync(outPath + '.tmp', outPath);
  const s = fs.statSync(outPath);
  console.log('optimized written, size=', s.size);
})();
