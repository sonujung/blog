'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: Record<string, unknown>[]
  }
}

interface AnalyticsProps {
  title?: string
}

export default function Analytics({ title }: AnalyticsProps) {
  const pathname = usePathname()
  const measurementId = GA_MEASUREMENT_ID ?? ''
  const isEnabled = Boolean(measurementId)

  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') {
      return
    }

    if (typeof window.gtag !== 'function') {
      return
    }

    window.gtag('config', measurementId, {
      page_path: window.location.pathname + window.location.search,
      page_title: title || document.title
    })
  }, [isEnabled, measurementId, pathname, title])

  if (!isEnabled) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname + window.location.search,
            page_title: document.title
          });
        `}
      </Script>
    </>
  )
}

export function AnalyticsOptional(props: AnalyticsProps) {
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  return <Analytics {...props} />
}
