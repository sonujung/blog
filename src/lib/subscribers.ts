import { Resend } from 'resend';

// RESEND_AUDIENCE_ID 환경변수 필요
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

// Resend 클라이언트 초기화
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY 환경변수가 설정되지 않았습니다.');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export interface Subscriber {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string; // Resend API 형식 맞춤
  unsubscribed: boolean; // Resend API 형식 맞춤
}


// 모든 구독자 조회 (Resend Audience에서)
export async function getSubscribers(): Promise<Subscriber[]> {
  try {
    if (!AUDIENCE_ID) {
      throw new Error('RESEND_AUDIENCE_ID 환경변수가 설정되지 않았습니다.');
    }

    const resend = getResendClient();
    const { data, error } = await resend.contacts.list({
      audienceId: AUDIENCE_ID,
    });

    if (error) {
      console.error('Resend API 오류:', error);
      return [];
    }

    // Resend 응답을 우리 인터페이스에 맞게 변환
    return data?.data || [];
  } catch (error) {
    console.error('구독자 데이터 로드 실패:', error);
    return [];
  }
}

// 활성 구독자만 조회
export async function getActiveSubscribers(): Promise<Subscriber[]> {
  const subscribers = await getSubscribers();
  return subscribers.filter(sub => !sub.unsubscribed);
}

// 새 구독자 추가 (Resend Audience에)
export async function addSubscriber(email: string, firstName?: string, lastName?: string): Promise<Subscriber | null> {
  try {
    if (!AUDIENCE_ID) {
      throw new Error('RESEND_AUDIENCE_ID 환경변수가 설정되지 않았습니다.');
    }

    const resend = getResendClient();
    
    // 먼저 중복 체크
    const existingSubscribers = await getSubscribers();
    const existingSubscriber = existingSubscribers.find(sub => sub.email === email);
    
    if (existingSubscriber && !existingSubscriber.unsubscribed) {
      throw new Error('이미 구독 중인 이메일 주소입니다.');
    }

    // Resend Audience에 추가
    const { data, error } = await resend.contacts.create({
      audienceId: AUDIENCE_ID,
      email,
      firstName,
      lastName,
    });

    if (error) {
      console.error('구독자 추가 오류:', error);
      throw new Error('구독자 추가에 실패했습니다.');
    }

    return data || null;
  } catch (error) {
    console.error('구독자 추가 실패:', error);
    throw error;
  }
}


// 구독 취소 (Resend Audience에서)
export async function unsubscribeByEmail(email: string): Promise<boolean> {
  try {
    if (!AUDIENCE_ID) {
      throw new Error('RESEND_AUDIENCE_ID 환경변수가 설정되지 않았습니다.');
    }

    const resend = getResendClient();
    
    // 먼저 해당 이메일의 contact를 찾기
    const subscribers = await getSubscribers();
    const subscriber = subscribers.find(sub => sub.email === email);
    
    if (!subscriber) {
      return false;
    }

    // Resend에서 구독 취소
    const { error } = await resend.contacts.update({
      audienceId: AUDIENCE_ID,
      id: subscriber.id,
      unsubscribed: true,
    });

    if (error) {
      console.error('구독 취소 오류:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('구독 취소 실패:', error);
    return false;
  }
}


// 구독자 통계
export async function getSubscriberStats() {
  const subscribers = await getSubscribers();
  return {
    total: subscribers.length,
    active: subscribers.filter(sub => !sub.unsubscribed).length,
    unsubscribed: subscribers.filter(sub => sub.unsubscribed).length
  };
}

// 구독자 상태 업데이트 (관리자용)
export async function updateSubscriberStatus(contactId: string, unsubscribed: boolean): Promise<boolean> {
  try {
    if (!AUDIENCE_ID) {
      throw new Error('RESEND_AUDIENCE_ID 환경변수가 설정되지 않았습니다.');
    }

    const resend = getResendClient();
    const { error } = await resend.contacts.update({
      audienceId: AUDIENCE_ID,
      id: contactId,
      unsubscribed,
    });

    if (error) {
      console.error('구독자 상태 업데이트 오류:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('구독자 상태 업데이트 실패:', error);
    return false;
  }
}