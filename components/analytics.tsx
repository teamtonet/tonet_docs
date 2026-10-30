import Script from 'next/script';

/**
 * First-touch attribution, the same snippet tonet.ai runs in its Ghost header
 * (tonet.io_react docs/attribution-ghost-snippet.html). A visit that arrives with a source
 * writes the 90-day .tonet.ai cookie, so an account that starts in the docs is credited
 * to the search, ad or link that brought it. Keep the two copies identical.
 */
export const ATTRIBUTION = `(function () {
  try {
    var NAME = "tonet_attribution", DAYS = 90;
    var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
                "gclid", "gbraid", "wbraid", "fbclid", "msclkid", "ttclid", "li_fat_id", "rdt_cid", "oppref"];
    var params = new URLSearchParams(location.search);
    var referrer = null;
    if (document.referrer) {
      var u = new URL(document.referrer);
      if (!/(^|\\.)tonet\\.(ai|io)$/.test(u.hostname)) {
        referrer = (u.hostname + u.pathname).slice(0, 300);
      }
    }
    var record = { first_seen_at: new Date().toISOString(),
                   landing_page: (location.hostname + location.pathname).slice(0, 300),
                   referrer: referrer };
    var hasSource = Boolean(referrer);
    KEYS.forEach(function (k) {
      var v = params.get(k);
      if (k === "rdt_cid" && v && !/^[A-Za-z0-9._~-]{1,200}$/.test(v)) return;
      if (k === "oppref") {
        if (v && /^[A-Za-z0-9._~=-]{1,512}$/.test(v)) { record[k] = v; hasSource = true; }
        return;
      }
      if (v) { record[k] = v.slice(0, 200); hasSource = true; }
    });
    if (!hasSource) { return; }
    var m = document.cookie.match(/(?:^|; )tonet_attribution=([^;]*)/);
    if (m) {
      var old = JSON.parse(decodeURIComponent(m[1]));
      if (old.first_seen_at && Date.now() - new Date(old.first_seen_at).getTime() < DAYS * 864e5) { return; }
    }
    document.cookie = NAME + "=" + encodeURIComponent(JSON.stringify(record)) +
      "; domain=.tonet.ai; path=/; max-age=" + DAYS * 86400 + "; SameSite=Lax; Secure";
  } catch (e) { /* attribution is best effort */ }
})();`;

/** GA4 (same property as tonet.ai and the dashboard) and Rybbit, loaded after the page. */
export function Analytics() {
  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-1N6KVQV3HQ" strategy="lazyOnload" />
      <Script id="ga4" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-1N6KVQV3HQ');`}
      </Script>
      <Script src="https://app.rybbit.io/api/script.js" data-site-id="8404" strategy="lazyOnload" />
    </>
  );
}
