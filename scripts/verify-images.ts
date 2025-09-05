#!/usr/bin/env npx ts-node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const POSTS_DIR = path.join(__dirname, '..', 'content', 'posts')
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images')

function analyzeImageReferences() {
  console.log('🔍 Analyzing image references vs actual files...\n')

  const posts = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'))
  const imageFiles = new Set(fs.readdirSync(IMAGES_DIR))

  let totalReferences = 0
  let existingImages = 0
  let missingImages = 0
  const missingImagesList: string[] = []

  for (const postFile of posts) {
    const postPath = path.join(POSTS_DIR, postFile)
    const content = fs.readFileSync(postPath, 'utf-8')
    
    // Extract image references
    const imageRegex = /!\[.*?\]\(\/images\/([^)]+)\)/g
    const matches = [...content.matchAll(imageRegex)]
    
    if (matches.length > 0) {
      const postSlug = postFile.replace('.md', '').replace(/^\d{4}-\d{2}-\d{2}-/, '')
      console.log(`📄 ${postSlug}: ${matches.length} image references`)
      
      for (const match of matches) {
        const imageFileName = match[1]
        totalReferences++
        
        if (imageFiles.has(imageFileName)) {
          existingImages++
          console.log(`  ✅ ${imageFileName}`)
        } else {
          missingImages++
          missingImagesList.push(`${postSlug}: ${imageFileName}`)
          console.log(`  ❌ ${imageFileName}`)
        }
      }
      console.log()
    }
  }

  console.log('📊 Summary:')
  console.log(`- Total image references: ${totalReferences}`)
  console.log(`- Existing images: ${existingImages}`)
  console.log(`- Missing images: ${missingImages}`)
  console.log(`- Total files in images dir: ${imageFiles.size}`)

  if (missingImagesList.length > 0) {
    console.log('\n❌ Missing images:')
    missingImagesList.forEach(item => console.log(`  - ${item}`))
  }

  // Sample some existing image files that might not be referenced
  const referencedImages = new Set<string>()
  for (const postFile of posts) {
    const content = fs.readFileSync(path.join(POSTS_DIR, postFile), 'utf-8')
    const imageRegex = /!\[.*?\]\(\/images\/([^)]+)\)/g
    const matches = [...content.matchAll(imageRegex)]
    matches.forEach(match => referencedImages.add(match[1]))
  }

  const unreferencedImages = Array.from(imageFiles).filter(img => !referencedImages.has(img))
  console.log(`\n📋 Unreferenced image files: ${unreferencedImages.length}`)
  if (unreferencedImages.length > 0) {
    console.log('First 10 unreferenced images:')
    unreferencedImages.slice(0, 10).forEach(img => console.log(`  - ${img}`))
  }
}

analyzeImageReferences()