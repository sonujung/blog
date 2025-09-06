'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscribersAdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new admin dashboard
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Redirecting...</h1>
        <p className="text-gray-600">Moving to the new admin dashboard</p>
      </div>
    </div>
  );
}