#!/bin/bash

# 이미지 매핑 및 다운로드 스크립트 생성
# 현재 로컬에 있는 이미지들과 포스트를 매핑하여 누락된 이미지 참조를 찾는다

echo "# 이미지 매핑 결과" > image_mapping_report.md
echo "## 포스트별 누락된 이미지 참조" >> image_mapping_report.md
echo "" >> image_mapping_report.md

# 누락된 이미지가 있는 포스트 목록
posts=(
    "workflowy-for-designer:2016-02-03-workflowy-for-designer.md:14"
    "ecommerce-is-a-bear:2016-09-13-ecommerce-is-a-bear.md:2"
    "framerx-vs-protopie:2019-01-23-framerx-vs-protopie.md:2"
    "hire-designer-and:2016-08-06-hire-designer-and-work-at-startups.md:2"
    "hire-sixhop-designers:2021-01-07-hire-sixhop-designers.md:10"
    "history-of-product:2017-04-21-history-of-product-design.md:31"
    "hit-refresh-reading:2021-05-30-hit-refresh-reading-note.md:2"
    "how-lazada-wins:2017-12-22-how-lazada-wins-in-sea-market.md:5"
    "how-the-web:2016-11-17-how-the-web-became-unreadable.md:5"
    "humans-vs-chatbots:2016-10-25-humans-vs-chatbots.md:6"
    "julie-zhuo-product:2021-02-08-julie-zhuo-product-thinking.md:1"
    "just-a-korean:2016-01-07-just-a-korean-webdesigner.md:5"
    "kpcb-designin-tech:2016-04-13-kpcb-designin-tech-report-2016.md:51"
    "political-correctness-in:2018-08-11-political-correctness-in-product.md:3"
    "product-design-in:2021-06-27-product-design-in-startup.md:19"
    "product-principles-of:2021-07-12-product-principles-of-sixshop.md:6"
    "product-team-vs:2019-10-30-product-team-vs-function-team.md:1"
    "retrospective-why-we:2015-01-15-retrospective-why-we-quit-our-project.md:6"
    "review-naver-renewal:2018-09-12-review-naver-renewal.md:4"
    "review-thieve-dropshipping:2019-03-06-review-thieve-dropshipping.md:6"
    "the-earth-is:2016-12-03-the-earth-is-your-canvas.md:10"
    "the-preventable-problem:2021-04-04-the-preventable-problem-paradox.md:26"
    "think-stack:2022-03-07-think-stack.md:6"
    "thoughts-about-design:2015-01-15-thoughts-about-design-agency.md:4"
    "what-if-clubhouse:2020-10-09-what-if-clubhouse-launches-in-korea.md:8"
    "why-startups-need:2019-10-29-why-startups-need-to-focus-on-sales-not-marketing.md:1"
    "why-vision-fund:2018-11-20-why-vision-fund-invests-to-coupang.md:1"
)

total_missing=0

for post_info in "${posts[@]}"; do
    IFS=':' read -r prefix filename count <<< "$post_info"
    echo "### $filename ($count images)" >> image_mapping_report.md
    echo "" >> image_mapping_report.md
    
    # 실제 이미지 파일들 나열
    for i in $(seq 1 $count); do
        img_file="${prefix}-img-${i}.png"
        if [ -f "/Users/sonujung/thinking-tools/blog/public/images/${img_file}" ]; then
            echo "- ![Image $i](/images/${img_file})" >> image_mapping_report.md
        else
            # PNG가 없으면 다른 확장자 확인
            for ext in jpg jpeg gif; do
                alt_file="${prefix}-img-${i}.${ext}"
                if [ -f "/Users/sonujung/thinking-tools/blog/public/images/${alt_file}" ]; then
                    echo "- ![Image $i](/images/${alt_file})" >> image_mapping_report.md
                    break
                fi
            done
        fi
    done
    
    echo "" >> image_mapping_report.md
    total_missing=$((total_missing + count))
done

echo "## 총합" >> image_mapping_report.md
echo "- 누락된 포스트: ${#posts[@]}개" >> image_mapping_report.md
echo "- 누락된 총 이미지: ${total_missing}개" >> image_mapping_report.md

echo "이미지 매핑 보고서가 image_mapping_report.md에 생성되었습니다."
echo "총 ${#posts[@]}개 포스트에서 ${total_missing}개 이미지가 누락되었습니다."