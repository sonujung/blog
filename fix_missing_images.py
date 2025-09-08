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

def analyze_missing_images():
    """누락된 이미지 분석"""
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
                    'referenced_count': len(referenced_images),
                    'available_count': len(available_image_names),
                    'missing_images': missing_images
                })
    
    return results

def main():
    print("이미지 참조 누락 분석 시작...")
    
    # 현재 디렉토리를 블로그 루트로 변경
    os.chdir('/Users/sonujung/thinking-tools/blog')
    
    missing_results = analyze_missing_images()
    
    print(f"\n총 {len(missing_results)}개 포스트에서 이미지 참조 누락 발견:")
    
    for result in missing_results:
        print(f"\n포스트: {result['post_slug']}")
        print(f"  참조된 이미지: {result['referenced_count']}개")
        print(f"  사용 가능한 이미지: {result['available_count']}개")
        print(f"  누락된 이미지: {', '.join(result['missing_images'])}")

if __name__ == "__main__":
    main()