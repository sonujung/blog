#!/usr/bin/env node
/**
 * 이메일 분석 및 정렬 스크립트
 * 사용법: node scripts/analyze-emails.js [파일경로]
 */

const fs = require('fs');
const path = require('path');

// 이메일 정규식
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// 메일 프로바이더별 그룹화
function groupByProvider(emails) {
  const groups = {};
  
  emails.forEach(email => {
    const domain = email.split('@')[1].toLowerCase();
    if (!groups[domain]) {
      groups[domain] = [];
    }
    groups[domain].push(email);
  });
  
  // 각 그룹 내에서 정렬
  Object.keys(groups).forEach(domain => {
    groups[domain].sort();
  });
  
  return groups;
}

// 도메인별 정렬 (인기순)
function sortDomainsByPopularity(groups) {
  return Object.keys(groups)
    .sort((a, b) => {
      // 1. 개수순 정렬 (내림차순)
      const countDiff = groups[b].length - groups[a].length;
      if (countDiff !== 0) return countDiff;
      
      // 2. 개수 같으면 알파벳순
      return a.localeCompare(b);
    });
}

// 파일에서 이메일 추출
function extractEmailsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const emails = content.match(EMAIL_REGEX) || [];
    
    // 중복 제거 및 소문자 변환
    return [...new Set(emails.map(email => email.toLowerCase().trim()))];
  } catch (error) {
    console.error(`파일 읽기 오류: ${error.message}`);
    return [];
  }
}

// 결과 출력
function displayResults(emails) {
  console.log(`\n📧 총 이메일 개수: ${emails.length}개`);
  
  if (emails.length === 0) {
    console.log('이메일이 발견되지 않았습니다.');
    return;
  }
  
  const groups = groupByProvider(emails);
  const sortedDomains = sortDomainsByPopularity(groups);
  
  console.log('\n📊 메일 프로바이더별 분석:');
  console.log('=' .repeat(50));
  
  let totalShown = 0;
  sortedDomains.forEach((domain, index) => {
    const count = groups[domain].length;
    console.log(`\n${index + 1}. @${domain} (${count}개)`);
    console.log('-'.repeat(30));
    
    groups[domain].forEach(email => {
      console.log(`   ${email}`);
      totalShown++;
    });
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`총 ${sortedDomains.length}개 도메인, ${totalShown}개 이메일`);
  
  // 도메인별 요약
  console.log('\n📈 도메인별 요약:');
  sortedDomains.forEach((domain, index) => {
    const count = groups[domain].length;
    const percentage = ((count / emails.length) * 100).toFixed(1);
    console.log(`${index + 1}. @${domain}: ${count}개 (${percentage}%)`);
  });
}

// CSV 출력
function generateCSV(emails) {
  const groups = groupByProvider(emails);
  const sortedDomains = sortDomainsByPopularity(groups);
  
  let csv = 'email,domain,provider_rank\n';
  
  sortedDomains.forEach((domain, domainIndex) => {
    groups[domain].forEach(email => {
      csv += `${email},${domain},${domainIndex + 1}\n`;
    });
  });
  
  return csv;
}

// 메인 함수
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('사용법: node scripts/analyze-emails.js [파일경로]');
    console.log('예시: node scripts/analyze-emails.js content/posts/email.md');
    return;
  }
  
  const filePath = args[0];
  
  if (!fs.existsSync(filePath)) {
    console.error(`파일을 찾을 수 없습니다: ${filePath}`);
    return;
  }
  
  console.log(`🔍 파일 분석 중: ${filePath}`);
  
  const emails = extractEmailsFromFile(filePath);
  displayResults(emails);
  
  // CSV 출력 옵션
  if (args.includes('--csv') || args.includes('-c')) {
    const csv = generateCSV(emails);
    const csvPath = filePath.replace(/\.[^.]+$/, '-sorted.csv');
    fs.writeFileSync(csvPath, csv);
    console.log(`\n📄 CSV 파일 생성: ${csvPath}`);
  }
  
  // JSON 출력 옵션  
  if (args.includes('--json') || args.includes('-j')) {
    const groups = groupByProvider(emails);
    const sortedDomains = sortDomainsByPopularity(groups);
    
    const result = {
      total: emails.length,
      domains: sortedDomains.length,
      groups: sortedDomains.reduce((acc, domain, index) => {
        acc[domain] = {
          rank: index + 1,
          count: groups[domain].length,
          emails: groups[domain]
        };
        return acc;
      }, {})
    };
    
    const jsonPath = filePath.replace(/\.[^.]+$/, '-analysis.json');
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
    console.log(`\n📋 JSON 파일 생성: ${jsonPath}`);
  }
}

main();