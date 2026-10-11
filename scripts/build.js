const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const products = JSON.parse(fs.readFileSync(path.join(root, 'products.json'), 'utf8'));
const siteUrl = String(process.env.URL || process.env.SITE_URL || 'https://YOUR-SITE-NAME.netlify.app').replace(/\/$/, '');
const affiliateToken = '__PRODUCT_AFFILIATE_URL__';
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const seen = new Set();
for (const p of products) {
  if (!p.name || !p.slug || !slugPattern.test(p.slug)) throw new Error(`Invalid product name/slug: ${JSON.stringify(p)}`);
  if (seen.has(p.slug)) throw new Error(`Duplicate product slug: ${p.slug}`);
  seen.add(p.slug);
  p.reviewFile = p.reviewFile || `reviews/${p.slug}/index.html`;
  if (!p.affiliateUrl || !/^https?:\/\//i.test(p.affiliateUrl)) throw new Error(`Missing/invalid affiliateUrl for ${p.name}`);
}
// Build from clean source into dist; never rewrite source files during deployment.
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
const copyItems = ['index.html','css','js','reviews','affiliate-disclosure.html','privacy-policy.html','disclaimer.html','robots.txt'];
for (const item of copyItems) {
  const from = path.join(root, item);
  if (fs.existsSync(from)) fs.cpSync(from, path.join(dist, item), { recursive: true });
}
// Generate a starter page for any product whose full review page has not been supplied yet.
for (const p of products) {
  const reviewPath = path.join(dist, p.reviewFile);
  if (!fs.existsSync(reviewPath)) {
    const templatePath = path.join(root, 'review-template.html');
    let page = fs.readFileSync(templatePath, 'utf8');
    const summary = p.description || `Read our detailed ${p.name} review.`;
    page = page.replaceAll('[Product Name]', p.name)
      .replaceAll('[product-slug]', p.slug)
      .replaceAll('[Clear, Accurate Summary]', summary)
      .replaceAll(affiliateToken, p.affiliateUrl);
    fs.mkdirSync(path.dirname(reviewPath), { recursive: true });
    fs.writeFileSync(reviewPath, page);
    console.log(`Generated starter review page: ${p.reviewFile}`);
  }
}
// Generate homepage cards: image/title/Read Full Review all point to the product's review page.
const cards = products.filter(p => p.published !== false).map(p => {
  const title = `${p.name} Review`;
  const href = `reviews/${p.slug}/`;
  const img = p.image ? `<a class="card-media" href="${href}" aria-label="Read ${escapeHtml(title)}"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.imageAlt || p.name)}" loading="lazy"></a>` : '';
  const shortReview = p.shortReview || p.description || `Read our detailed ${p.name} review.`;
  return `<article class="card" data-title="${escapeHtml(`${p.name} ${p.description || ''} ${shortReview}`.toLowerCase())}" data-category="${escapeHtml((p.category || 'other').toLowerCase())}">\n${img}\n<div class="card-body"><span class="tag">${escapeHtml(p.label || 'Product Review')}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(p.description || '')}</p><p class="short-review">${escapeHtml(shortReview)}</p><a class="btn" href="${href}">Read Full Review →</a></div>\n</article>`;
}).join('\n');
let home = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const cardMarker = /<!-- AUTO_REVIEW_CARDS_START -->[\s\S]*?<!-- AUTO_REVIEW_CARDS_END -->/;
if (!cardMarker.test(home)) throw new Error('Homepage card markers are missing.');
home = home.replace(cardMarker, `<!-- AUTO_REVIEW_CARDS_START -->\n${cards}\n<!-- AUTO_REVIEW_CARDS_END -->`);
const categories = [...new Set(products.filter(p => p.published !== false).map(p => String(p.category || 'other').toLowerCase()))].sort();
const categoryOptions = `<option value="all">All categories</option>${categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c.charAt(0).toUpperCase()+c.slice(1))}</option>`).join('')}`;
home = home.replace(/<!-- AUTO_CATEGORY_OPTIONS_START -->[\s\S]*?<!-- AUTO_CATEGORY_OPTIONS_END -->/, `<!-- AUTO_CATEGORY_OPTIONS_START -->${categoryOptions}<!-- AUTO_CATEGORY_OPTIONS_END -->`);
fs.writeFileSync(path.join(dist, 'index.html'), home);
// Apply current site URL and each product's affiliate URL only to built files.
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full);
    else if (item.isFile() && /\.(html|txt|xml|js|css)$/i.test(item.name)) {
      let content = fs.readFileSync(full, 'utf8');
      content = content.replaceAll('__SITE_URL__', siteUrl);
      for (const p of products) {
        // Product pages are isolated by their own directory; each token resolves to its product URL.
        if (path.resolve(full) === path.resolve(dist, p.reviewFile)) {
          content = content.replaceAll(affiliateToken, p.affiliateUrl);
        }
      }
      fs.writeFileSync(full, content);
    }
  }
}
walk(dist);
// Always regenerate sitemap from product data and the actual Netlify primary URL.
const urls = [ `${siteUrl}/`, ...products.filter(p => p.published !== false).map(p => `${siteUrl}/reviews/${p.slug}/`), `${siteUrl}/affiliate-disclosure.html`, `${siteUrl}/privacy-policy.html`, `${siteUrl}/disclaimer.html` ];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(urls)].map(url => `  <url><loc>${escapeHtml(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
console.log(`Build complete: ${products.length} product(s). Output: dist/ Site URL: ${siteUrl}`);
