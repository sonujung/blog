#!/usr/bin/env python3
import os
import glob
import re
from collections import defaultdict

# 이미지 디렉토리
image_dir = "/Users/sonujung/thinking-tools/blog/public/images"

# 포스트별 이미지 그룹핑
post_images = defaultdict(list)

# 모든 이미지 파일 탐색
for img_file in glob.glob(os.path.join(image_dir, "*")):
    filename = os.path.basename(img_file)
    
    # cover 이미지는 제외
    if filename.startswith("cover-"):
        continue
    
    # unused 디렉토리는 제외
    if "unused" in filename:
        continue
    
    # 패턴 매칭: post-name-img-X.extension
    match = re.match(r'(.+)-img-(\d+)\.(png|jpg|jpeg|gif)$', filename)
    if match:
        post_prefix = match.group(1)
        img_num = int(match.group(2))
        extension = match.group(3)
        
        post_images[post_prefix].append({
            'num': img_num,
            'filename': filename,
            'extension': extension
        })

# 정렬
for post_prefix in post_images:
    post_images[post_prefix].sort(key=lambda x: x['num'])

print("# 상세 이미지 분석 결과\n")
print("## 포스트별 이미지 현황\n")

total_images = 0
total_posts = 0

for post_prefix, images in sorted(post_images.items()):
    total_posts += 1
    total_images += len(images)
    
    print(f"### {post_prefix} ({len(images)}개 이미지)")
    print()
    
    for img in images:
        print(f"- ![Image {img['num']}](/images/{img['filename']})")
    
    print()

print(f"## 총 요약")
print(f"- 이미지가 있는 포스트: {total_posts}개")
print(f"- 총 이미지 수: {total_images}개")
print()

# 누락된 번호 확인
print("## 누락된 이미지 번호 확인")
print()

for post_prefix, images in sorted(post_images.items()):
    img_nums = [img['num'] for img in images]
    max_num = max(img_nums)
    missing = []
    
    for i in range(1, max_num + 1):
        if i not in img_nums:
            missing.append(i)
    
    if missing:
        print(f"- {post_prefix}: 누락된 번호 {missing}")

print()