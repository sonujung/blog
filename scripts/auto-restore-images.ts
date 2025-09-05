import fs from 'fs'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts')
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')

interface ImageInfo {
  postSlug: string
  imageNum: number
  fileName: string
  exists: boolean
}

function scanExistingImages(): Map<string, ImageInfo[]> {
  const imageFiles = fs.readdirSync(IMAGES_DIR)
  const imagesByPost = new Map<string, ImageInfo[]>()

  // 커버 이미지는 제외하고 본문 이미지만 처리
  const contentImages = imageFiles.filter(file => 
    !file.startsWith('cover-') && 
    file.match(/-img-\d+\.(png|jpg|jpeg|gif)$/)
  )

  for (const fileName of contentImages) {
    // 파일명에서 포스트 슬러그와 이미지 번호 추출
    const match = fileName.match(/^(.+)-img-(\d+)\.(png|jpg|jpeg|gif)$/)
    if (match) {
      const [, postSlug, imageNumStr] = match
      const imageNum = parseInt(imageNumStr)
      
      if (!imagesByPost.has(postSlug)) {
        imagesByPost.set(postSlug, [])
      }
      
      imagesByPost.get(postSlug)!.push({
        postSlug,
        imageNum,
        fileName,
        exists: true
      })
    }
  }

  // 각 포스트의 이미지들을 번호순으로 정렬
  for (const [postSlug, images] of imagesByPost) {
    images.sort((a, b) => a.imageNum - b.imageNum)
  }

  return imagesByPost
}

function findPostFile(postSlug: string): string | null {
  const files = fs.readdirSync(CONTENT_DIR)
  
  // 정확한 매치 찾기 (날짜 접두사 고려)
  const exactMatch = files.find(file => 
    file.includes(postSlug) && file.endsWith('.md')
  )
  
  if (exactMatch) {
    return path.join(CONTENT_DIR, exactMatch)
  }
  
  return null
}

function addImagesToPost(postPath: string, images: ImageInfo[]) {
  let content = fs.readFileSync(postPath, 'utf-8')
  const postSlug = images[0].postSlug
  
  console.log(`📝 Processing: ${path.basename(postPath)} (${images.length} images)`)
  
  let addedCount = 0
  
  // 각 이미지에 대해 이미 참조가 있는지 확인
  for (const image of images) {
    const imageRef = `${image.postSlug}-img-${image.imageNum}`
    
    // 이미 이미지 참조가 있는지 확인
    if (content.includes(imageRef)) {
      console.log(`  ⏭️  Image ${image.imageNum} already referenced`)
      continue
    }
    
    // 이미지 참조 생성
    const imageMarkdown = `![Image ${image.imageNum}](/images/${image.fileName})`
    
    // 적절한 위치에 삽입 시도
    let inserted = false
    
    // 특정 패턴들 뒤에 이미지 삽입 시도
    const insertPatterns = [
      /\n\n$/,  // 파일 끝
      /\n\n---\n\n/,  // 구분선 앞
      /\n\n## /,  // 섹션 제목 앞
      /\n\n### /,  // 서브 섹션 제목 앞
    ]
    
    // 문단 사이에 골고루 분산해서 삽입
    const paragraphs = content.split('\n\n')
    const targetIndex = Math.min(
      paragraphs.length - 1,
      Math.floor((image.imageNum / images.length) * paragraphs.length)
    )
    
    if (targetIndex > 2) { // 제목 부분 이후에 삽입
      paragraphs.splice(targetIndex, 0, imageMarkdown)
      content = paragraphs.join('\n\n')
      inserted = true
      addedCount++
      console.log(`  ✅ Added image ${image.imageNum} at position ${targetIndex}`)
    }
    
    // 삽입에 실패하면 파일 끝에 추가
    if (!inserted) {
      content = content.trim() + '\n\n' + imageMarkdown
      addedCount++
      console.log(`  ✅ Added image ${image.imageNum} at end`)
    }
  }
  
  // 업데이트된 내용 저장
  if (addedCount > 0) {
    fs.writeFileSync(postPath, content, 'utf-8')
    console.log(`✅ Added ${addedCount} images to ${path.basename(postPath)}\n`)
  } else {
    console.log(`ℹ️  No new images added to ${path.basename(postPath)}\n`)
  }
  
  return addedCount
}

async function main() {
  console.log('🚀 Auto-restoring missing image references...\n')
  
  // 기존 이미지 파일들 스캔
  const imagesByPost = scanExistingImages()
  
  console.log(`📊 Found ${imagesByPost.size} posts with images:`)
  for (const [postSlug, images] of imagesByPost) {
    console.log(`  - ${postSlug}: ${images.length} images`)
  }
  console.log('')
  
  let totalProcessed = 0
  let totalAdded = 0
  
  // 각 포스트에 대해 이미지 참조 복구
  for (const [postSlug, images] of imagesByPost) {
    const postPath = findPostFile(postSlug)
    
    if (!postPath) {
      console.log(`❌ Post file not found for: ${postSlug}`)
      continue
    }
    
    const addedCount = addImagesToPost(postPath, images)
    totalAdded += addedCount
    totalProcessed++
    
    // 각 포스트 처리 간 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log('🎉 Auto-restoration completed!')
  console.log(`📋 Summary:`)
  console.log(`  - Processed: ${totalProcessed} posts`)
  console.log(`  - Added: ${totalAdded} image references`)
  console.log(`  - Total images available: ${Array.from(imagesByPost.values()).reduce((sum, imgs) => sum + imgs.length, 0)}`)
}

main().catch(console.error)