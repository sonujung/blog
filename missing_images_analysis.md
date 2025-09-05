# 누락된 이미지 분석 결과

## 현재 상황 요약
- 총 69개의 마크다운 포스트 파일이 있음
- 이미지 참조(`![...]`)가 있는 포스트: 6개만
- public/images 디렉토리에 존재하는 이미지: 400개 이상
- 대부분의 포스트에서 이미지 참조가 누락된 상태

## 이미지가 있지만 마크다운에서 참조되지 않는 포스트들

### 고이미지 포스트 (10개 이상)
1. **kpcb-designin-tech-report-2016**: 51개 이미지
2. **history-of-product-design**: 31개 이미지  
3. **the-preventable-problem-paradox**: 26개 이미지
4. **product-design-in-startup**: 19개 이미지
5. **workflowy-for-designer**: 14개 이미지
6. **hire-sixhop-designers**: 10개 이미지
7. **the-earth-is-your-canvas**: 10개 이미지

### 중이미지 포스트 (5-9개)
8. **humans-vs-chatbots**: 6개 이미지
9. **product-principles-of-sixshop**: 6개 이미지
10. **retrospective-why-we-quit-our-project**: 6개 이미지
11. **review-thieve-dropshipping**: 6개 이미지
12. **think-stack**: 6개 이미지
13. **what-if-clubhouse-launches-in-korea**: 8개 이미지
14. **how-lazada-wins-in-sea-market**: 5개 이미지
15. **how-the-web-became-unreadable**: 5개 이미지
16. **just-a-korean-webdesigner**: 5개 이미지

### 저이미지 포스트 (1-4개)
17. **ecommerce-is-a-bear**: 2개 이미지
18. **framerx-vs-protopie**: 2개 이미지
19. **hire-designer-and-work-at-startups**: 2개 이미지
20. **hit-refresh-reading-note**: 2개 이미지
21. **political-correctness-in-product**: 3개 이미지
22. **review-naver-renewal**: 4개 이미지
23. **thoughts-about-design-agency**: 4개 이미지
24. **julie-zhuo-product-thinking**: 1개 이미지
25. **product-team-vs-function-team**: 1개 이미지
26. **why-startups-need-to-focus-on-sales-not-marketing**: 1개 이미지
27. **why-vision-fund-invests-to-coupang**: 1개 이미지

## 이미 참조되고 있는 포스트들 (정상)
1. **critique-about-optical-adjustment-by-luke-jones**: 5개 이미지 ✓
2. **a-brief-history-of-shopify**: 27개 이미지 ✓  
3. **growth-strategies-of-figma**: 12개 이미지 ✓
4. **data-informed-product-building-no2**: 4개 이미지 ✓
5. **data-informed-product-building-no3**: 1개 이미지 ✓
6. **today-i-learned-2021-04**: 5개 이미지 ✓

## 총 누락된 이미지 수
- 누락된 포스트: 27개
- 누락된 총 이미지: 약 275개

## 다음 단계 권장사항
1. 원본 hashnode.dev에서 각 포스트의 이미지 URL 추출
2. 로컬 이미지와 매핑하여 마크다운 파일에 이미지 참조 추가
3. 우선순위: 고이미지 포스트부터 처리
4. 이미지 다운로드 스크립트로 누락된 이미지 확보