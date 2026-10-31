"use client";

import Script from "next/script";
import { useConsent } from "@/lib/consent";

/** Loads GA4 only after the visitor accepted cookies. */
export function Analytics({ gaId }: { gaId: string }) {
  const consent = useConsent();
  if (!gaId || consent !== "granted") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
gtag('config', '${gaId}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
