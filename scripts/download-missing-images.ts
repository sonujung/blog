import fs from 'fs'
import path from 'path'
import https from 'https'
import { URL } from 'url'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')

// 이미지 URL에서 파일명 생성
function generateImageFileName(postSlug: string, imageUrl: string, index: number): string {
  const url = new URL(imageUrl)
  const ext = path.extname(url.pathname) || '.png'
  return `${postSlug}-img-${index + 1}${ext}`
}

// 이미지 다운로드
async function downloadImage(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath)
    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log(`Downloaded: ${path.basename(filePath)}`)
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}) // 실패시 파일 삭제
      reject(err)
    })
  })
}

// 포스트에서 외부 이미지 URL 추출 및 다운로드
async function processPost(postPath: string) {
  const content = fs.readFileSync(postPath, 'utf-8')
  const postSlug = path.basename(postPath, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '')
  
  // Hashnode CDN 이미지 찾기
  const imageRegex = /!\[.*?\]\((https:\/\/cdn\.hashnode\.com[^)]+)\)/g
  const matches = Array.from(content.matchAll(imageRegex))
  
  if (matches.length === 0) {
    return content
  }
  
  console.log(`Processing ${postSlug}: Found ${matches.length} images`)
  
  let updatedContent = content
  
  for (let i = 0; i < matches.length; i++) {
    const [fullMatch, imageUrl] = matches[i]
    const fileName = generateImageFileName(postSlug, imageUrl, i)
    const localPath = path.join(IMAGES_DIR, fileName)
    const relativePath = `/images/${fileName}`
    
    try {
      // 이미지가 이미 존재하는지 확인
      if (!fs.existsSync(localPath)) {
        await downloadImage(imageUrl, localPath)
        await new Promise(resolve => setTimeout(resolve, 1000)) // 1초 대기
      }
      
      // 마크다운 내용 업데이트
      updatedContent = updatedContent.replace(imageUrl, relativePath)
      
    } catch (error) {
      console.error(`Failed to download ${imageUrl}:`, error)
    }
  }
  
  // 업데이트된 내용 저장
  if (updatedContent !== content) {
    fs.writeFileSync(postPath, updatedContent, 'utf-8')
    console.log(`Updated ${postSlug}`)
  }
  
  return updatedContent
}

// 메인 실행
async function main() {
  // images 디렉토리 생성
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true })
  }
  
  const postFiles = fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .sort()
  
  console.log(`Found ${postFiles.length} posts`)
  
  for (const file of postFiles) {
    const postPath = path.join(POSTS_DIR, file)
    try {
      await processPost(postPath)
    } catch (error) {
      console.error(`Error processing ${file}:`, error)
    }
  }
  
  console.log('Finished processing all posts')
}

main().catch(console.error)