// Manual image download for specific missing images
import fs from 'fs'
import https from 'https'
import path from 'path'

// Known image URLs from the original blog
const imageUrls = {
  'data-informed-product-building-no2-img-1.png': 'https://cdn.hashnode.com/res/hashnode/image/upload/v1635689361317/LjXAJnFqc.png',
  'data-informed-product-building-no2-img-2.png': 'https://cdn.hashnode.com/res/hashnode/image/upload/v1635697360935/WLw3IKamn.png', 
  'data-informed-product-building-no2-img-3.png': 'https://cdn.hashnode.com/res/hashnode/image/upload/v1635699085017/8TgaUDUuk.png',
  'data-informed-product-building-no2-img-4.png': 'https://cdn.hashnode.com/res/hashnode/image/upload/v1635706527260/JHCDuf1Bk.png',
  'data-informed-product-building-no3-img-1.png': 'https://cdn.hashnode.com/res/hashnode/image/upload/v1638016187677/UgaW17FO5.png'
}

async function downloadImage(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${filePath}`)
    
    const file = fs.createWriteStream(filePath)
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        console.error(`Failed to download ${url}: ${response.statusCode}`)
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }
      
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log(`Successfully downloaded: ${path.basename(filePath)}`)
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}) // Delete the file on error
      reject(err)
    })
  })
}

async function main() {
  const imagesDir = path.join(process.cwd(), 'public', 'images')
  
  for (const [fileName, url] of Object.entries(imageUrls)) {
    const filePath = path.join(imagesDir, fileName)
    
    try {
      // Delete existing 0-byte file if it exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      
      await downloadImage(url, filePath)
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2초 대기
    } catch (error) {
      console.error(`Failed to download ${fileName}:`, error)
    }
  }
  
  console.log('Manual image download completed')
}

main().catch(console.error)