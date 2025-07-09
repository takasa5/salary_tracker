const sharp = require('sharp');
const path = require('path');

const iconSize = 20; // Common size for menu bar icons

async function generateIcon() {
  const svg = `
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="cutout-mask">
          <rect x="0" y="0" width="${iconSize}" height="${iconSize}" fill="white"/>
          <text x="50%" y="50%" dy="5" font-family="Arial" font-size="${iconSize * 0.7}" fill="black" text-anchor="middle" dominant-baseline="middle">¥</text>
        </mask>
      </defs>
      <circle cx="${iconSize / 2}" cy="${iconSize / 2}" r="${iconSize / 2 * 0.9}" fill="white" mask="url(#cutout-mask)"/>
    </svg>
  `;

  const outputPath = path.resolve(__dirname, '../src/assets/icon.png');

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
