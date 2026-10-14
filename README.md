# Forma — A softer way to live

An original furniture storefront concept with six fictional, AI-generated products on a consistent light gray studio background.

Live website: https://melsaka.github.io/forma-furniture-studio/

Repository: https://github.com/melsaka/forma-furniture-studio

The design pairs warm ivory, forest green, muted clay, Manrope, and Cormorant Garamond italic. It includes a responsive editorial homepage, product details, category filters, sorting, live search, saved pieces, a persistent shopping bag, quantity controls, and a clearly labeled demo checkout.

## Run

Serve this folder with any static HTTP server, or open `index.html` locally. No build, dependencies, accounts, or API keys are required. Fonts and images are included locally.

## Free GitHub Pages publication

Publish this folder at the repository root. In **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/(root)**. Save. The project URL will be `https://OWNER.github.io/REPOSITORY/`.

This is an educational design showcase, not an operating online business. The products and prices are fictional. It does not collect personal information, create real orders, or process payments. GitHub Pages is not permitted for running a transactional ecommerce business; a production store would need suitable hosting and a payment backend.

## Customize

- Product names, prices, specifications, and descriptions: `app.js`.
- Colors, type, responsive layout, and animations: `styles.css`.
- Homepage sections and metadata: `index.html`.
- Original built-in ImageGen prompt set: `image-prompts.json`.

Product WebP images live in `assets/`. Manrope and Cormorant Garamond are open-source fonts distributed under the SIL Open Font License; their licenses are included alongside the font files.

Bag and saved-piece state is kept in browser local storage only. The site contains no analytics, tracking scripts, remote fonts, payment fields, or forms that transmit personal data.
