/**
 * Hashnode Newsletter 구독자 추출 스크립트
 * 
 * 사용법:
 * 1. Hashnode 대시보드 → Newsletter 페이지 열기
 * 2. F12 개발자 도구 → Console 탭 열기
 * 3. 이 스크립트를 붙여넣고 실행
 * 4. 결과를 복사해서 CSV 파일로 저장
 */

(function() {
  console.log('🔍 Hashnode Newsletter 구독자 추출 시작...');
  
  // 방법 1: 페이지에서 이메일 텍스트 찾기
  function extractEmailsFromPage() {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const pageText = document.body.innerText;
    const emails = pageText.match(emailRegex) || [];
    
    return [...new Set(emails)]; // 중복 제거
  }
  
  // 방법 2: 테이블이나 리스트 구조에서 추출
  function extractFromStructuredElements() {
    const emails = [];
    
    // 일반적인 테이블 셀에서 이메일 찾기
    document.querySelectorAll('td, .email, [class*="email"], [class*="subscriber"]').forEach(el => {
      const text = el.textContent.trim();
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        emails.push(emailMatch[0]);
      }
    });
    
    return [...new Set(emails)];
  }
  
  // 방법 3: 네트워크 요청 모니터링 (이미 로드된 데이터)
  function extractFromNetworkData() {
    // 전역 변수나 React 상태에서 데이터 찾기
    const possibleDataSources = [
      window.__NEXT_DATA__,
      window.__INITIAL_STATE__,
      window.store,
      window.props,
    ];
    
    const emails = [];
    
    possibleDataSources.forEach(source => {
      if (source) {
        const sourceStr = JSON.stringify(source);
        const emailMatches = sourceStr.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (emailMatches) {
          emails.push(...emailMatches);
        }
      }
    });
    
    return [...new Set(emails)];
  }
  
  // 방법 4: GraphQL 요청 시도
  async function tryGraphQLQuery() {
    try {
      // Hashnode의 인증 토큰을 쿠키나 localStorage에서 찾기
      const token = localStorage.getItem('hashnode-token') || 
                   sessionStorage.getItem('hashnode-token') ||
                   document.cookie.match(/hashnode[_-]?token=([^;]+)/)?.[1];
      
      if (!token) {
        console.log('⚠️  인증 토큰을 찾을 수 없습니다.');
        return [];
      }
      
      // GraphQL 쿼리 시도 (추측)
      const queries = [
        `query { me { publication { newsletter { subscribers { email } } } } }`,
        `query { me { publications { edges { node { newsletter { subscribers { email } } } } } } }`,
        `query MyPublication($slug: String!) { publication(host: $slug) { newsletter { subscribers { email } } } }`
      ];
      
      for (const query of queries) {
        try {
          const response = await fetch('https://gql.hashnode.com/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query })
          });
          
          const data = await response.json();
          console.log('GraphQL 응답:', data);
          
          if (data.data) {
            const dataStr = JSON.stringify(data.data);
            const emails = dataStr.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
            if (emails && emails.length > 0) {
              return [...new Set(emails)];
            }
          }
        } catch (e) {
          console.log(`GraphQL 쿼리 실패: ${e.message}`);
        }
      }
      
      return [];
    } catch (error) {
      console.log('GraphQL 시도 중 오류:', error);
      return [];
    }
  }
  
  // 모든 방법 시도
  async function extractAllEmails() {
    console.log('📧 이메일 추출 중...');
    
    const pageEmails = extractEmailsFromPage();
    console.log(`페이지 텍스트에서 ${pageEmails.length}개 발견`);
    
    const structuredEmails = extractFromStructuredElements();
    console.log(`구조화된 요소에서 ${structuredEmails.length}개 발견`);
    
    const networkEmails = extractFromNetworkData();
    console.log(`네트워크 데이터에서 ${networkEmails.length}개 발견`);
    
    const graphqlEmails = await tryGraphQLQuery();
    console.log(`GraphQL에서 ${graphqlEmails.length}개 발견`);
    
    // 모든 이메일 합치고 중복 제거
    const allEmails = [...new Set([
      ...pageEmails,
      ...structuredEmails,
      ...networkEmails,
      ...graphqlEmails
    ])];
    
    // 유효한 이메일만 필터링
    const validEmails = allEmails.filter(email => {
      return email.includes('@') && 
             email.includes('.') && 
             email.length < 100 && // 너무 긴 것 제외
             !/\s/.test(email); // 공백 포함된 것 제외
    });
    
    console.log(`\n✅ 총 ${validEmails.length}개의 유효한 이메일 발견:`);
    console.log(validEmails);
    
    // CSV 형태로 출력
    const csvData = 'email\n' + validEmails.join('\n');
    console.log('\n📄 CSV 형태:');
    console.log(csvData);
    
    // 클립보드에 복사 시도
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(csvData);
        console.log('\n📋 CSV 데이터가 클립보드에 복사되었습니다!');
      } catch (e) {
        console.log('\n⚠️  클립보드 복사 실패. 수동으로 복사해주세요.');
      }
    }
    
    return validEmails;
  }
  
  // 실행
  extractAllEmails();
  
  console.log('\n💡 사용법:');
  console.log('1. 위의 CSV 데이터를 복사');
  console.log('2. 텍스트 파일로 저장 (예: hashnode-subscribers.csv)');
  console.log('3. 프로젝트에서 import 스크립트 실행');
})();