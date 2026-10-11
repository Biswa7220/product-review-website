ALL-IN-ONE PRODUCT REVIEW WEBSITE — DEPLOYMENT GUIDE

WHAT IS INCLUDED
- Homepage with product image, short description, short review and a Read Full Review link.
- Phytomem One full review page with ingredient images, price/package comparison, evidence notes, pros/cons, precautions, FAQ and affiliate calls to action.
- Homepage card links, canonical URLs and sitemap entries generated during build.
- Affiliate URL is stored once in products.json and inserted into affiliate-link tokens on the matching review page.
- Build output goes into dist/; source files are not rewritten by the build.

FIRST DEPLOY (RECOMMENDED: GITHUB + NETLIFY)
1. Download and extract this ZIP on your computer.
2. Open https://github.com/ and sign in (create a free account if needed).
3. Click + > New repository. Name it product-review-website. Choose Private or Public, then Create repository.
4. On the empty repository page choose the option to upload files. Upload the CONTENTS of the extracted project folder (index.html, products.json, package.json, netlify.toml, scripts/, reviews/, css/, js/, etc.). Do not upload only the ZIP itself. Commit the files.
5. Open https://app.netlify.com/ and sign in.
6. Select Add new project > Import an existing project, choose GitHub, authorize Netlify, and select product-review-website.
7. Confirm Build command is `npm run build` and Publish directory is `dist`. netlify.toml already contains these settings.
8. Click Deploy. Wait for the build to finish, then open the generated *.netlify.app URL.
9. Test the homepage card. Click the Phytomem One image or Read Full Review; it should open /reviews/phytomem-one/. Test the affiliate buttons from that page.

WHY USE GITHUB?
Netlify will rebuild and publish whenever you push a new commit. A manual drag-and-drop upload does not reliably provide the ongoing build workflow needed for automatic cards and sitemap generation.

HOW TO ADD ANOTHER PRODUCT LATER
1. Add a new object to products.json with unique name, slug (lowercase-with-hyphens), category, label, description, shortReview, image, imageAlt, affiliateUrl and published:true. Example: slug `audifort`. Enter that product's affiliate URL once here.
2. Add its full review at reviews/audifort/index.html (copy review-template.html as a starting point, then replace the placeholder text and add the detailed review). In the new page, use `__PRODUCT_AFFILIATE_URL__` for all affiliate buttons/images that should use the stored URL. The build replaces the token automatically.
3. Commit the changes to GitHub. Netlify rebuilds. The homepage card and link, canonical URL and sitemap URL are generated automatically. Existing product pages stay live as long as you keep their products.json entries and review files.

IMPORTANT CONTENT NOTES
- The Phytomem One affiliate URL currently saved from your existing Phytomem One source page is stored once in products.json. Verify it opens your intended offer before promotion.
- Package prices shown in the review are reference prices and can change; confirm current pricing at checkout.
- Product images are referenced from the Phytomem One image host. If that host changes or blocks hotlinking, images may need to be hosted inside this project.
- Review the Privacy Policy and update it to match any analytics, cookies, or tracking tools you actually use.
- A new product's page can be generated as a starter if missing, but you must add accurate full-review content before publishing it as a complete review.

PROJECT STRUCTURE
- products.json: central product list and affiliate URLs
- scripts/build.js: generates homepage cards, affiliate links, canonical URLs and sitemap
- reviews/phytomem-one/index.html: full Phytomem One review
- review-template.html: starting template for future reviews
- netlify.toml: Netlify build and publish settings
