import Script from "next/script";

/**
 * Loads gtag.js and defines window.gtag. Renders nothing when
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is not set (e.g. local development).
 *
 * `send_page_view` is disabled because page views are tracked on route
 * changes by AnalyticsPageViewTracker.
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
