const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

/**
 * Generates a branded PWA icon.
 * @param {number} size - Square dimension in pixels.
 */
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background (Saffron)
  ctx.fillStyle = '#FF6B00';
  ctx.fillRect(0, 0, size, size);

  // Logo Text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.45}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('QP', size / 2, size / 2);

  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(__dirname, '../public', `icon-${size}.png`);
  
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated: ${filePath}`);
}

// Generate standard PWA sizes
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

generateIcon(192);
generateIcon(512);

console.log('PWA Icons generated successfully in /public');
