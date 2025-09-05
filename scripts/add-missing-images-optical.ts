// Add missing images to optical adjustment post
import fs from 'fs'
import path from 'path'

const postPath = path.join(process.cwd(), 'content', 'posts', '2015-12-31-critique-about-optical-adjustment-by-luke-jones.md')

// Read the current content
let content = fs.readFileSync(postPath, 'utf-8')

// Add image placeholders at appropriate locations
const replacements = [
  {
    search: '삼각형을 정확히 가운데 놓기 위해서는 우선 사각형의 틀을 원으로 바꿔야 한다.',
    replace: '![시각적 정렬 예시](/images/critique-about-optical-adjustment-by-luke-jones-img-1.png)\n\n삼각형을 정확히 가운데 놓기 위해서는 우선 사각형의 틀을 원으로 바꿔야 한다.'
  },
  {
    search: '그림의 좌측엔 가로세로 10의 크기를 갖는 사각형과 동일 크기의 사각형에 담긴 원이 그려져 있다.',
    replace: '![도형 면적 비교](/images/critique-about-optical-adjustment-by-luke-jones-img-2.png)\n\n그림의 좌측엔 가로세로 10의 크기를 갖는 사각형과 동일 크기의 사각형에 담긴 원이 그려져 있다.'
  },
  {
    search: '한번 확대한 화면을 살펴보자.',
    replace: '한번 확대한 화면을 살펴보자.\n\n![색상 차이 확대 화면](/images/critique-about-optical-adjustment-by-luke-jones-img-3.png)'
  },
  {
    search: '서체의 두께가 두꺼울 경우에 같은 색상을 표현하는데 별 문제 없어 보인다.',
    replace: '![서체 두께에 따른 색상 차이](/images/critique-about-optical-adjustment-by-luke-jones-img-4.png)\n\n서체의 두께가 두꺼울 경우에 같은 색상을 표현하는데 별 문제 없어 보인다.'
  },
  {
    search: '배경색에 따라 동일색상이 다르게 보이는 현상.',
    replace: '![배경색에 따른 색상 인식 차이](/images/critique-about-optical-adjustment-by-luke-jones-img-5.png)\n\n배경색에 따라 동일색상이 다르게 보이는 현상.'
  }
]

// Apply replacements
for (const replacement of replacements) {
  content = content.replace(replacement.search, replacement.replace)
}

// Write updated content
fs.writeFileSync(postPath, content, 'utf-8')

console.log('Added image placeholders to optical adjustment post')
console.log('Note: Actual image files need to be added to /public/images/')