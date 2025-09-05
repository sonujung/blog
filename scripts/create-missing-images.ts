#!/usr/bin/env npx ts-node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images')

// Create simple placeholder SVG images
const createPlaceholderSVG = (imageNum: number, width = 600, height = 400) => {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
      Image ${imageNum}
      Optical Adjustment
    </text>
  </svg>`
}

const missingImages = [
  'critique-about-optical-adjustment-by-luke-jones-img-1.png',
  'critique-about-optical-adjustment-by-luke-jones-img-2.png',
  'critique-about-optical-adjustment-by-luke-jones-img-3.png',
  'critique-about-optical-adjustment-by-luke-jones-img-4.png',
  'critique-about-optical-adjustment-by-luke-jones-img-5.png'
]

console.log('🎨 Creating placeholder images for missing optical adjustment post...\n')

for (let i = 0; i < missingImages.length; i++) {
  const imageName = missingImages[i]
  const imageNum = i + 1
  
  // Create SVG content
  const svgContent = createPlaceholderSVG(imageNum)
  
  // Save as SVG (changing extension from .png to .svg)
  const svgPath = path.join(IMAGES_DIR, imageName.replace('.png', '.svg'))
  fs.writeFileSync(svgPath, svgContent, 'utf-8')
  
  console.log(`✅ Created placeholder: ${imageName.replace('.png', '.svg')}`)
}

console.log('\n🎉 Placeholder images created!')
console.log('Note: These are SVG placeholders. You may want to replace with actual images from the original blog.')