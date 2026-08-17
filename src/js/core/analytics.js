const RETAILERS = [
  { match: 'amazon.com', name: 'Amazon' },
  { match: 'barnesandnoble.com', name: 'Barnes & Noble' },
  { match: 'books.google.com', name: 'Google Books' },
];

function retailerFor(href) {
  const found = RETAILERS.find((retailer) => href.includes(retailer.match));
  return found ? found.name : null;
}

/**
 * Fires a dataLayer event on any click through to a retailer link (Amazon,
 * Barnes & Noble, Google Books): covers every "Get The Book" CTA and
 * purchase-panel link sitewide by domain, so new links need no extra wiring.
 * GA4 itself is configured inside GTM (not a direct gtag.js snippet here),
 * so this only needs to push the event; mapping it to a GA4 event tag is a
 * GTM console step, not code.
 */
export function initOutboundTracking() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;

    const retailer = retailerFor(link.href);
    if (!retailer) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'get_book_click',
      retailer,
      link_url: link.href,
      link_text: link.textContent.trim(),
    });
  });
}
