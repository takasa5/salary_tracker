const sharp = require('sharp');
const path = require('path');

const iconSize = 32; // Common size for menu bar icons

async function generateIcon() {
  const svg = `
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${iconSize}" height="${iconSize}" fill="transparent"/>
      <text x="50%" y="50%" font-family="Arial" font-size="${iconSize * 0.7}" fill="black" text-anchor="middle" dominant-baseline="middle">¥</text>
    </svg>
  `;

  const outputPath = path.resolve(__dirname, '../src/icon.png');

  try {
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
    console.log(`Icon generated successfully at ${outputPath}`);
  } catch (error) {
    console.error('Error generating icon:', error);
  }
}

generateIcon();
