'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { BlogPost } from '@/types/blog';

interface AnalyticsStats {
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
  dailyStats: Array<{
    date: string;
    views: number;
    visitors: number;
  }>;
}

interface SubscriberStats {
  totalActiveSubscribers: number;
  recentSubscribers: Array<{
    email: string;
    subscribedAt: string;
  }>;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'newsletter'>('overview');
  
  // Analytics data
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState(7);
  
  // Newsletter data
  const [subscriberStats, setSubscriberStats] = useState<SubscriberStats | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [sendingStates, setSendingStates] = useState<Record<string, boolean>>({});
  const [sendResults, setSendResults] = useState<Record<string, any>>({});
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics();
    }
  }, [analyticsPeriod, isAuthenticated]);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
    }
  };

  const handleAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        alert(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('로그인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load posts
      const postsResponse = await fetch('/api/posts?limit=10');
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData.posts);
      }

      // Load subscriber stats
      await loadSubscriberStats();
    } catch (error) {
      console.error('Dashboard data load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?days=${analyticsPeriod}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsStats(data.stats);
      }
    } catch (error) {
      console.error('Analytics load error:', error);
    }
  };

  const loadSubscriberStats = async () => {
    try {
      const response = await fetch('/api/notify-subscribers');
      if (response.ok) {
        const data = await response.json();
        console.log('Subscriber stats loaded:', data);
        setSubscriberStats(data);
      } else {
        console.error('Subscriber stats API failed:', response.status);
      }
    } catch (error) {
      console.error('Subscriber stats load error:', error);
    }
  };

  const sendNewsletterForPost = async (post: BlogPost) => {
    setSendingStates(prev => ({ ...prev, [post.slug]: true }));
    
    try {
      const response = await fetch('/api/notify-subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_NOTIFICATION_API_KEY || 'secure-key-for-notifications-123'}`
        },
        body: JSON.stringify({
          slug: post.slug,
          action: 'notify'
        })
      });

      const data = await response.json();
      
      setSendResults(prev => ({
        ...prev,
        [post.slug]: {
          success: response.ok,
          message: data.message,
          stats: data.stats
        }
      }));

    } catch (error) {
      setSendResults(prev => ({
        ...prev,
        [post.slug]: {
          success: false,
          message: 'Network error occurred',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    } finally {
      setSendingStates(prev => ({ ...prev, [post.slug]: false }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAuthentication}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-semibold text-gray-900">
                Sonu Jung Admin
              </Link>
              <nav className="flex space-x-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'analytics'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('newsletter')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'newsletter'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Newsletter
                </button>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Page Views (7d)</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsStats?.totalPageViews || '-'}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Unique Visitors</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsStats?.uniqueVisitors || '-'}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Active Subscribers</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriberStats?.totalActiveSubscribers ?? '-'}
                </p>
                {/* 디버그 정보 */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-400 mt-1">
                    Debug: {subscriberStats ? 'Data loaded' : 'No data'} | 
                    Count: {subscriberStats?.totalActiveSubscribers} | 
                    Recent: {subscriberStats?.recentSubscribers?.length}
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Posts</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {posts.length}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/admin/subscribers"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Manage Subscribers
                </Link>
                <Link
                  href="/subscribe"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  View Subscribe Page
                </Link>
                <Link
                  href="/"
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  View Blog
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <select
                value={analyticsPeriod}
                onChange={(e) => setAnalyticsPeriod(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>

            {analyticsStats ? (
              <>
                {/* Traffic Channels */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Traffic Sources</h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {analyticsStats.channels.map((channel, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{channel.count}</div>
                        <div className="text-sm text-gray-500 capitalize">{channel.channel}</div>
                        <div className="text-xs text-gray-400">{channel.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Referrers */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Referrers</h2>
                  <div className="space-y-3">
                    {analyticsStats.topReferrers?.map((referrer, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {referrer.domain === 'direct' ? 'Direct Traffic' : referrer.domain}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">{referrer.count} visits</span>
                          <span className="text-xs text-gray-400 w-10 text-right">{referrer.percentage}%</span>
                        </div>
                      </div>
                    ))}
                    {(!analyticsStats.topReferrers || analyticsStats.topReferrers.length === 0) && (
                      <p className="text-gray-500 text-sm italic">No referral data yet</p>
                    )}
                  </div>
                </div>

                {/* Top Pages */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Pages</h2>
                  <div className="space-y-2">
                    {analyticsStats.topPages.map((page, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <div className="font-medium text-gray-900">{page.title || page.path}</div>
                          <div className="text-sm text-gray-500">{page.path}</div>
                        </div>
                        <div className="text-lg font-semibold text-gray-600">{page.views}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily Stats Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Activity</h2>
                  <div className="space-y-2">
                    {analyticsStats.dailyStats.map((day, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">{day.date}</span>
                        <div className="flex space-x-4">
                          <span className="text-sm">Views: {day.views}</span>
                          <span className="text-sm">Visitors: {day.visitors}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-12 rounded-lg shadow text-center">
                <p className="text-gray-500">Loading analytics data...</p>
              </div>
            )}
          </div>
        )}

        {/* Newsletter Tab */}
        {activeTab === 'newsletter' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Newsletter Management</h1>
            
            {/* Subscriber Stats */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscriber Statistics</h2>
              
              {/* 디버그 섹션 */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-3 bg-gray-50 rounded text-xs">
                  <div>subscriberStats: {subscriberStats ? 'exists' : 'null'}</div>
                  <div>totalActiveSubscribers: {subscriberStats?.totalActiveSubscribers}</div>
                  <div>recentSubscribers length: {subscriberStats?.recentSubscribers?.length}</div>
                  <div>Raw data: {JSON.stringify(subscriberStats, null, 2)}</div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {subscriberStats?.totalActiveSubscribers ?? 0}
                  </div>
                  <div className="text-sm text-gray-500">Active Subscribers</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Recent Subscribers</div>
                  <div className="mt-2 space-y-1">
                    {subscriberStats?.recentSubscribers?.slice(0, 3).map((sub, index) => (
                      <div key={index} className="text-xs text-gray-500">
                        {sub.email} - {new Date(sub.subscribedAt).toLocaleDateString()}
                      </div>
                    )) || (
                      <div className="text-xs text-gray-400">No recent subscribers yet</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Posts with Send Newsletter */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Newsletter</h2>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.slug} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{post.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString()} • {post.slug}
                      </p>
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 mt-1">{post.excerpt.substring(0, 100)}...</p>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <button
                        onClick={() => sendNewsletterForPost(post)}
                        disabled={sendingStates[post.slug]}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          sendingStates[post.slug]
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : sendResults[post.slug]?.success
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {sendingStates[post.slug] ? 'Sending...' : 
                         sendResults[post.slug]?.success ? 'Sent ✓' : 'Send Newsletter'}
                      </button>
                      
                      {sendResults[post.slug] && (
                        <div className={`text-xs p-2 rounded ${
                          sendResults[post.slug].success 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {sendResults[post.slug].message}
                          {sendResults[post.slug].stats && (
                            <div className="mt-1">
                              Sent: {sendResults[post.slug].stats.sent} / {sendResults[post.slug].stats.totalSubscribers}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}