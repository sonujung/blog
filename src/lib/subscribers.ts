import fs from 'fs';
import path from 'path';

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'subscribers.json');

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  unsubscribeToken?: string;
}

// 구독자 데이터 파일이 없으면 생성
function ensureSubscribersFile() {
  try {
    const dataDir = path.dirname(SUBSCRIBERS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.warn('파일 시스템 초기화 실패:', error);
    // 서버리스 환경에서는 파일 생성이 불가능할 수 있음
  }
}

// 모든 구독자 조회
export function getSubscribers(): Subscriber[] {
  try {
    ensureSubscribersFile();
    const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('구독자 데이터 로드 실패:', error);
    return [];
  }
}

// 활성 구독자만 조회
export function getActiveSubscribers(): Subscriber[] {
  return getSubscribers().filter(sub => sub.status === 'active');
}

// 새 구독자 추가
export function addSubscriber(email: string): Subscriber {
  const subscribers = getSubscribers();
  
  // 이미 존재하는 이메일인지 확인
  const existingSubscriber = subscribers.find(sub => sub.email === email);
  if (existingSubscriber) {
    if (existingSubscriber.status === 'unsubscribed') {
      // 구독 취소된 사용자가 다시 구독하는 경우
      existingSubscriber.status = 'active';
      existingSubscriber.subscribedAt = new Date().toISOString();
      saveSubscribers(subscribers);
      return existingSubscriber;
    }
    throw new Error('이미 구독 중인 이메일 주소입니다.');
  }
  
  // 새 구독자 생성
  const newSubscriber: Subscriber = {
    id: generateId(),
    email,
    subscribedAt: new Date().toISOString(),
    status: 'active',
    unsubscribeToken: generateUnsubscribeToken()
  };
  
  subscribers.push(newSubscriber);
  saveSubscribers(subscribers);
  
  return newSubscriber;
}

// 구독자 데이터 저장
function saveSubscribers(subscribers: Subscriber[]) {
  try {
    ensureSubscribersFile();
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
  } catch (error) {
    console.error('구독자 데이터 저장 실패:', error);
    // 서버리스 환경에서는 파일 저장이 실패할 수 있음 - 에러를 던지지 않음
    console.warn('구독자 데이터가 임시로 저장되지 못했습니다. 외부 DB 연결을 고려해보세요.');
  }
}

// 구독 취소
export function unsubscribeByToken(token: string): boolean {
  const subscribers = getSubscribers();
  const subscriber = subscribers.find(sub => sub.unsubscribeToken === token);
  
  if (!subscriber) {
    return false;
  }
  
  subscriber.status = 'unsubscribed';
  saveSubscribers(subscribers);
  
  return true;
}

// ID 생성
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 구독 취소 토큰 생성
function generateUnsubscribeToken(): string {
  return Math.random().toString(36).substr(2, 15);
}

// 구독자 통계
export function getSubscriberStats() {
  const subscribers = getSubscribers();
  return {
    total: subscribers.length,
    active: subscribers.filter(sub => sub.status === 'active').length,
    unsubscribed: subscribers.filter(sub => sub.status === 'unsubscribed').length
  };
}