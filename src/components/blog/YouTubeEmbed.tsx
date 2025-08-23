import React from 'react';

interface YouTubeEmbedProps {
  videoId: string;
}

export default function YouTubeEmbed({ videoId }: YouTubeEmbedProps) {
  return (
    <div className="my-8 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="relative w-full h-0" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-sm"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

// YouTube URL에서 비디오 ID 추출
export function getYouTubeVideoId(url: string): string | null {
  // YouTube URL에서 video ID 추출을 위한 여러 패턴
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// 컨텐츠에서 YouTube 링크 처리
export function processYouTubeContent(content: string): React.ReactElement[] {
  const elements: React.ReactElement[] = [];
  const lines = content.split('\n');
  let elementKey = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // %[youtube_url] 형태의 링크 찾기
    const youtubeMatch = line.match(/%\[(https?:\/\/(www\.)?(youtube\.com|youtu\.be)[^\]]+)\]/);
    
    if (youtubeMatch) {
      const videoId = getYouTubeVideoId(youtubeMatch[1]);
      if (videoId) {
        elements.push(
          <YouTubeEmbed key={`youtube-${elementKey++}`} videoId={videoId} />
        );
        continue;
      }
    }
    
    // 일반 텍스트는 문자열로 추가 (나중에 ReactMarkdown으로 처리)
    if (line.trim()) {
      elements.push(
        <div key={`text-${elementKey++}`} dangerouslySetInnerHTML={{ __html: line }} />
      );
    }
  }
  
  return elements;
}