#!/usr/bin/env node

/**
 * Generate favicons from logo.svg
 * 
 * Prerequisites:
 * npm install sharp
 * 
 * Usage:
 * node generate-favicons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log('Sharp not found. Installing...');
  console.log('Run: npm install sharp');
  console.log('Then run this script again.');
  process.exit(1);
}

const sizes = [16, 32, 48, 64, 128, 256, 512];
const inputSvg = path.join(__dirname, 'public', 'logo.svg');
const outputDir = path.join(__dirname, 'public');

async function generateFavicons() {
  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(inputSvg);
    
    console.log('Generating favicons...');
    
    // Generate different sizes
    for (const size of sizes) {
      const outputFile = path.join(outputDir, `favicon-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      
      console.log(`✓ Generated favicon-${size}x${size}.png`);
    }
    
    // Generate favicon.ico (32x32)
    const icoFile = path.join(outputDir, 'favicon.ico');
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(icoFile);
    
    console.log('✓ Generated favicon.ico');
    console.log('\n🎉 All favicons generated successfully!');
    
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons(); 