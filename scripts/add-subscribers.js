#!/usr/bin/env node
/**
 * Hashnode 구독자 수동 추가 스크립트
 * 사용법: node scripts/add-subscribers.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 구독자 데이터 파일 경로
const SUBSCRIBERS_FILE = path.join(process.cwd(), 'src', 'data', 'subscribers.json');

// 구독자 데이터 파일 생성 (없는 경우)
function ensureSubscribersFile() {
  const dataDir = path.dirname(SUBSCRIBERS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(SUBSCRIBERS_FILE)) {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([], null, 2));
  }
}

// 기존 구독자 목록 로드
function loadSubscribers() {
  try {
    const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// 구독자 추가
function addSubscriber(email) {
  const subscribers = loadSubscribers();
  
  // 중복 체크
  if (subscribers.some(sub => sub.email === email)) {
    console.log(`⚠️  이미 존재하는 이메일: ${email}`);
    return false;
  }
  
  // 새 구독자 생성
  const newSubscriber = {
    email: email.toLowerCase().trim(),
    subscribedAt: new Date().toISOString(),
    status: 'active',
    unsubscribeToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    source: 'hashnode_migration'
  };
  
  subscribers.push(newSubscriber);
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
  
  console.log(`✅ 구독자 추가: ${email}`);
  return true;
}

// 대화형 구독자 추가
async function interactiveAdd() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('\n📧 Hashnode 구독자 수동 추가 도구');
  console.log('-----------------------------------');
  console.log('💡 팁: 여러 이메일을 쉼표로 구분하여 한 번에 입력 가능');
  console.log('💡 종료하려면 빈 줄 입력\n');
  
  const askForEmail = () => {
    rl.question('이메일 주소 입력: ', (input) => {
      if (!input.trim()) {
        console.log('\n👋 추가 완료!');
        showStats();
        rl.close();
        return;
      }
      
      // 쉼표로 구분된 여러 이메일 처리
      const emails = input.split(',').map(e => e.trim()).filter(e => e);
      let added = 0;
      
      emails.forEach(email => {
        if (email.includes('@') && email.includes('.')) {
          if (addSubscriber(email)) {
            added++;
          }
        } else {
          console.log(`❌ 잘못된 이메일 형식: ${email}`);
        }
      });
      
      if (added > 0) {
        console.log(`🎉 ${added}개 이메일 추가 완료!\n`);
      }
      
      askForEmail(); // 다음 입력 요청
    });
  };
  
  askForEmail();
}

// CSV 파일에서 가져오기
function importFromCSV(csvFile) {
  if (!fs.existsSync(csvFile)) {
    console.log(`❌ 파일을 찾을 수 없습니다: ${csvFile}`);
    return;
  }
  
  const csvData = fs.readFileSync(csvFile, 'utf8');
  const lines = csvData.split('\n').filter(line => line.trim());
  
  console.log(`📁 CSV 파일에서 ${lines.length}개 라인 발견`);
  
  let added = 0;
  lines.forEach((line, index) => {
    // 첫 번째 라인이 헤더인 경우 스킵
    if (index === 0 && line.toLowerCase().includes('email')) return;
    
    // 쉼표로 구분된 첫 번째 필드를 이메일로 가정
    const email = line.split(',')[0].trim().replace(/"/g, '');
    
    if (email.includes('@') && email.includes('.')) {
      if (addSubscriber(email)) {
        added++;
      }
    }
  });
  
  console.log(`🎉 CSV에서 ${added}개 이메일 추가 완료!`);
}

// 현재 구독자 통계
function showStats() {
  const subscribers = loadSubscribers();
  const active = subscribers.filter(s => s.status === 'active');
  const fromHashnode = subscribers.filter(s => s.source === 'hashnode_migration');
  
  console.log('\n📊 구독자 통계');
  console.log('---------------');
  console.log(`총 구독자: ${subscribers.length}`);
  console.log(`활성 구독자: ${active.length}`);
  console.log(`Hashnode 마이그레이션: ${fromHashnode.length}`);
  console.log();
}

// 메인 실행
async function main() {
  ensureSubscribersFile();
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 대화형 모드
    await interactiveAdd();
  } else if (args[0] === 'stats') {
    // 통계 보기
    showStats();
  } else if (args[0] === 'csv' && args[1]) {
    // CSV 파일에서 가져오기
    importFromCSV(args[1]);
    showStats();
  } else {
    // 직접 이메일 추가
    args.forEach(email => {
      if (email.includes('@')) {
        addSubscriber(email);
      }
    });
    showStats();
  }
}

main().catch(console.error);