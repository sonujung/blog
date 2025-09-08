#!/usr/bin/env python3

import os
import re
import glob

def get_post_files():
    """모든 마크다운 포스트 파일 가져오기"""
    return glob.glob('content/posts/*.md')

def get_image_references(content):
    """마크다운 내용에서 이미지 참조 추출"""
    pattern = r'!\[.*?\]\(/images/([^)]+)\)'
    return re.findall(pattern, content)

def get_available_images(post_slug):
    """특정 포스트에 사용 가능한 이미지 파일들 찾기"""
    pattern = f'public/images/{post_slug}-img-*.png'
    files = glob.glob(pattern)
    # jpg, jpeg도 확인
    files.extend(glob.glob(f'public/images/{post_slug}-img-*.jpg'))
    files.extend(glob.glob(f'public/images/{post_slug}-img-*.jpeg'))
    files.extend(glob.glob(f'public/images/{post_slug}-img-*.gif'))
    files.extend(glob.glob(f'public/images/{post_slug}-img-*.svg'))
    return sorted(files)

def extract_image_number(filename):
    """이미지 파일명에서 번호 추출"""
    match = re.search(r'-img-(\d+)', filename)
    return int(match.group(1)) if match else 0

def get_post_slug(filename):
    """포스트 파일명에서 slug 추출"""
    basename = os.path.basename(filename)
    # 날짜 부분 제거 (YYYY-MM-DD-)
    slug = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', basename)
    # .md 확장자 제거
    slug = slug.replace('.md', '')
    return slug

def find_last_image_position(content, post_slug):
    """마지막 이미지의 위치 찾기"""
    # 해당 포스트의 이미지 패턴 찾기
    pattern = rf'!\[Image \d+\]\(/images/{re.escape(post_slug)}-img-\d+\.[^)]+\)'
    matches = list(re.finditer(pattern, content))
    
    if matches:
        # 마지막 이미지 매치의 끝 위치
        return matches[-1].end()
    else:
        # 이미지가 없으면 파일 끝에서 빈 줄들 제거 후 위치
        content_stripped = content.rstrip()
        return len(content_stripped)

def add_missing_image(content, post_slug, missing_image):
    """누락된 이미지를 적절한 위치에 추가"""
    # 이미지 번호 추출
    image_num_match = re.search(r'-img-(\d+)', missing_image)
    if not image_num_match:
        return content
    
    image_num = int(image_num_match.group(1))
    
    # 현재 있는 이미지들 중 가장 큰 번호 찾기
    current_images = get_image_references(content)
    current_images = [img for img in current_images if post_slug in img]
    
    if not current_images:
        # 현재 이미지가 없으면 파일 끝에 추가
        return content.rstrip() + f'\n\n![Image {image_num}](/images/{missing_image})\n'
    
    # 마지막 이미지 위치 찾기
    last_pos = find_last_image_position(content, post_slug)
    
    # 새 이미지 추가
    new_image = f'\n\n![Image {image_num}](/images/{missing_image})'
    
    # 내용을 두 부분으로 나누고 사이에 이미지 삽입
    before = content[:last_pos]
    after = content[last_pos:]
    
    return before + new_image + after

def analyze_and_fix_missing_images(dry_run=True):
    """누락된 이미지 분석 및 수정"""
    results = []
    
    post_files = get_post_files()
    
    for post_file in post_files:
        with open(post_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        post_slug = get_post_slug(post_file)
        
        # 현재 참조된 이미지들
        referenced_images = get_image_references(content)
        referenced_images = [img for img in referenced_images if post_slug in img]
        
        # 사용 가능한 이미지 파일들
        available_images = get_available_images(post_slug)
        available_image_names = [os.path.basename(img) for img in available_images]
        
        if len(referenced_images) != len(available_image_names):
            missing_images = []
            for img_file in available_image_names:
                if img_file not in referenced_images:
                    missing_images.append(img_file)
            
            if missing_images:
                results.append({
                    'post_file': post_file,
                    'post_slug': post_slug,
                    'missing_images': missing_images,
                    'original_content': content
                })
                
                if not dry_run:
                    # 실제로 파일 수정
                    modified_content = content
                    for missing_img in missing_images:
                        modified_content = add_missing_image(modified_content, post_slug, missing_img)
                    
                    # 파일 저장
                    with open(post_file, 'w', encoding='utf-8') as f:
                        f.write(modified_content)
                    
                    print(f"✅ {post_file} - {len(missing_images)}개 이미지 추가됨")
    
    return results

def main():
    print("누락된 이미지 자동 추가 시작...")
    
    # 현재 디렉토리를 블로그 루트로 변경
    os.chdir('/Users/sonujung/thinking-tools/blog')
    
    # 먼저 dry run으로 테스트
    print("\n=== Dry Run 모드 ===")
    missing_results = analyze_and_fix_missing_images(dry_run=True)
    
    print(f"\n총 {len(missing_results)}개 포스트에서 이미지 참조 누락 발견:")
    
    total_missing = 0
    for result in missing_results:
        missing_count = len(result['missing_images'])
        total_missing += missing_count
        print(f"  {result['post_slug']}: {missing_count}개 이미지")
    
    print(f"\n총 {total_missing}개의 이미지가 추가될 예정입니다.")
    
    # 자동으로 실제 실행
    print("\n=== 실제 수정 실행 ===")
    analyze_and_fix_missing_images(dry_run=False)
    print(f"\n✅ {len(missing_results)}개 포스트 수정 완료!")

if __name__ == "__main__":
    main()