import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ANALYTICS_FILE = path.join(process.cwd(), 'data', 'analytics.json');

export interface PageView {
  id: string;
  path: string;
  title?: string;
  timestamp: string;
  userAgent: string;
  referrer: string;
  referrerDomain: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  channel: 'direct' | 'search' | 'social' | 'referral' | 'email' | 'other';
  ipHash: string; // 개인정보 보호를 위한 해싱된 IP
}

export interface AnalyticsStats {
  totalPageViews: number;
  uniqueVisitors: number;
  topPages: Array<{
    path: string;
    views: number;
    title?: string;
  }>;
  channels: Array<{
    channel: string;
    count: number;
    percentage: number;
  }>;
  topReferrers: Array<{
    domain: string;
    count: number;
    percentage: number;
  }>;
  recentViews: PageView[];
  dailyStats: Array<{
    date: string;
    views: number;
    visitors: number;
  }>;
}

// Analytics 데이터 파일이 없으면 생성
function ensureAnalyticsFile() {
  try {
    const dataDir = path.dirname(ANALYTICS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(ANALYTICS_FILE)) {
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.warn('Analytics 파일 시스템 초기화 실패:', error);
    // 서버리스 환경에서는 파일 생성이 불가능할 수 있음
  }
}

// 페이지뷰 데이터 로드
export function getPageViews(): PageView[] {
  try {
    ensureAnalyticsFile();
    const data = fs.readFileSync(ANALYTICS_FILE, 'utf8');
    return JSON.parse(data) as PageView[];
  } catch (error) {
    console.error('Analytics 파일 읽기 오류:', error);
    return [];
  }
}

// IP 주소 해싱 (개인정보 보호)
function hashIP(ip: string): string {
  const salt = process.env.ANALYTICS_SALT || 'blog-analytics-salt';
  return crypto.createHash('sha256').update(ip + salt).digest('hex').substring(0, 16);
}

// 유입 채널 분류
function classifyChannel(referrer: string, utmSource?: string, utmMedium?: string): PageView['channel'] {
  // UTM 파라미터 우선
  if (utmMedium) {
    switch (utmMedium.toLowerCase()) {
      case 'email':
        return 'email';
      case 'social':
        return 'social';
      case 'cpc':
      case 'ppc':
        return 'search';
      default:
        break;
    }
  }

  if (utmSource) {
    const source = utmSource.toLowerCase();
    if (['google', 'bing', 'yahoo', 'duckduckgo', 'naver', 'daum'].some(s => source.includes(s))) {
      return 'search';
    }
    if (['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'tiktok'].some(s => source.includes(s))) {
      return 'social';
    }
    if (source.includes('email') || source.includes('newsletter')) {
      return 'email';
    }
  }

  // Referrer 기반 분류
  if (!referrer || referrer === '') {
    return 'direct';
  }

  try {
    const domain = new URL(referrer).hostname.toLowerCase();
    
    // 검색 엔진
    if (['google.', 'bing.', 'yahoo.', 'duckduckgo.', 'naver.', 'daum.'].some(s => domain.includes(s))) {
      return 'search';
    }
    
    // 소셜 미디어
    if (['facebook.', 'twitter.', 'linkedin.', 'instagram.', 'youtube.', 'tiktok.', 't.co', 'fb.me'].some(s => domain.includes(s))) {
      return 'social';
    }
    
    // 이메일 클라이언트
    if (['mail.', 'outlook.', 'gmail.'].some(s => domain.includes(s))) {
      return 'email';
    }
    
    return 'referral';
  } catch (error) {
    return 'other';
  }
}

// 페이지뷰 추가
export function addPageView(data: {
  path: string;
  title?: string;
  userAgent: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  ip: string;
}): PageView {
  const pageViews = getPageViews();
  
  const referrerDomain = data.referrer ? (() => {
    try {
      return new URL(data.referrer).hostname;
    } catch {
      return '';
    }
  })() : '';

  const pageView: PageView = {
    id: crypto.randomUUID(),
    path: data.path,
    title: data.title,
    timestamp: new Date().toISOString(),
    userAgent: data.userAgent,
    referrer: data.referrer,
    referrerDomain,
    utmSource: data.utmSource,
    utmMedium: data.utmMedium,
    utmCampaign: data.utmCampaign,
    channel: classifyChannel(data.referrer, data.utmSource, data.utmMedium),
    ipHash: hashIP(data.ip)
  };

  pageViews.push(pageView);
  
  // 30일 이전 데이터는 정리 (성능을 위해)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const filteredViews = pageViews.filter(view => 
    new Date(view.timestamp) > thirtyDaysAgo
  );

  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(filteredViews, null, 2));
  } catch (error) {
    console.error('Analytics 데이터 저장 실패:', error);
    // 서버리스 환경에서는 파일 저장이 실패할 수 있음 - 에러를 던지지 않음
    console.warn('Analytics 데이터가 임시로 저장되지 못했습니다. 외부 DB 연결을 고려해보세요.');
  }
  return pageView;
}

// Analytics 통계 생성
export function getAnalyticsStats(days: number = 7): AnalyticsStats {
  const pageViews = getPageViews();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentViews = pageViews.filter(view => 
    new Date(view.timestamp) > cutoffDate
  );

  // 총 페이지뷰
  const totalPageViews = recentViews.length;
  
  // 유니크 방문자 (IP 해시 기준)
  const uniqueVisitors = new Set(recentViews.map(view => view.ipHash)).size;
  
  // 인기 페이지
  const pageStats = recentViews.reduce((acc, view) => {
    const key = view.path;
    if (!acc[key]) {
      acc[key] = { path: view.path, title: view.title, views: 0 };
    }
    acc[key].views++;
    return acc;
  }, {} as Record<string, { path: string; title?: string; views: number }>);
  
  const topPages = Object.values(pageStats)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // 채널별 통계
  const channelStats = recentViews.reduce((acc, view) => {
    acc[view.channel] = (acc[view.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const channels = Object.entries(channelStats)
    .map(([channel, count]) => ({
      channel,
      count,
      percentage: Math.round((count / totalPageViews) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  // Referrer 도메인별 통계
  const referrerStats = recentViews.reduce((acc, view) => {
    const domain = view.referrerDomain || 'direct';
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topReferrers = Object.entries(referrerStats)
    .map(([domain, count]) => ({
      domain,
      count,
      percentage: Math.round((count / totalPageViews) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 일별 통계
  const dailyStats = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dateString = date.toISOString().split('T')[0];
    
    const dayViews = recentViews.filter(view => 
      view.timestamp.startsWith(dateString)
    );
    
    return {
      date: dateString,
      views: dayViews.length,
      visitors: new Set(dayViews.map(view => view.ipHash)).size
    };
  });

  return {
    totalPageViews,
    uniqueVisitors,
    topPages,
    channels,
    topReferrers,
    recentViews: recentViews.slice(0, 20),
    dailyStats
  };
}