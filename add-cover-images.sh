#!/bin/bash

# 커버 이미지를 모든 포스트에 자동으로 추가하는 스크립트

echo "커버 이미지 자동 추가 작업 시작..."

# 처리된 포스트 수 카운터
processed=0
added=0

# 모든 커버 이미지 파일 처리
for cover_file in public/images/cover-*.jpg; do
  if [ -f "$cover_file" ]; then
    # 파일명에서 slug 추출 (cover-{slug}.jpg -> {slug})
    basename=$(basename "$cover_file")
    slug=${basename#cover-}  # cover- 제거
    slug=${slug%.jpg}        # .jpg 제거
    
    # 해당 slug를 포함하는 포스트 파일 찾기
    post_file=$(find content/posts/ -name "*${slug}.md" | head -1)
    
    if [ -n "$post_file" ]; then
      echo "매칭 발견: $basename -> $post_file"
      
      # 이미 coverImage가 있는지 확인
      if ! grep -q "coverImage:" "$post_file"; then
        # coverImage 필드 추가
        # excerpt 줄 다음에 coverImage 추가
        if grep -q "excerpt:" "$post_file"; then
          # excerpt 줄 다음에 추가
          sed -i.bak "/^excerpt:/a\\
coverImage: \"/images/$basename\"" "$post_file"
        else
          # excerpt가 없으면 tags 다음에 추가  
          sed -i.bak "/^tags:/a\\
excerpt: \"\"\\
coverImage: \"/images/$basename\"" "$post_file"
        fi
        
        if [ $? -eq 0 ]; then
          echo "  ✅ 커버 이미지 추가 완료: /images/$basename"
          ((added++))
        else
          echo "  ❌ 커버 이미지 추가 실패"
        fi
      else
        echo "  ⏭️  이미 커버 이미지가 설정되어 있음"
      fi
      
      ((processed++))
    else
      echo "❓ 매칭되는 포스트를 찾을 수 없음: $basename"
    fi
  fi
done

echo ""
echo "작업 완료!"
echo "처리된 커버 이미지: $processed개"
echo "추가된 커버 이미지: $added개"
echo "백업 파일들: *.md.bak"