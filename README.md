# Know Your Rights

A multilingual "Know Your Rights" card for immigrant communities — a simple static site that prints cleanly, works offline, and is fully accessible.

**Live:** [ekinstitute.github.io/rights](https://ekinstitute.github.io/rights/)

## Features

- **Works offline** — Install as an app, access without internet (critical during detention)
- **4 languages** — English, Spanish, Somali, Hmong (more welcome!)
- **Print-friendly** — Clean single-page printout
- **QR codes** — Print QR codes that link directly to each language
- **Mobile-first** — Tappable phone numbers, readable on any device
- **Shareable** — Copy link button, language preserved in URL
- **Installable** — Add to home screen on any device (PWA)

## Accessibility

Built to WCAG 2.1 AA standards:

- **Screen reader support** — Live announcements for language changes and actions
- **Keyboard navigation** — Skip link, visible focus indicators, full keyboard access
- **Reduced motion** — Respects `prefers-reduced-motion` system preference
- **High contrast** — Enhanced styles for `prefers-contrast: more`
- **Touch targets** — Minimum 44×44px buttons on touch devices
- **Semantic HTML** — Proper landmarks, headings, and ARIA attributes
- **Localized dates** — Last updated shown in selected language format

## Contributing a Translation

1. Fork this repository
2. Copy `content/en.md` to `content/<language-code>.md`
3. Translate all content (keep phone numbers and org names as-is)
4. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Development

```bash
npm install
npm run dev     # Start dev server at localhost:5173
npm run build   # Build for production
```

## Deploying to GitHub Pages

1. Create a new repo (e.g., `rights`)
2. Push this code to the repo
3. Go to **Settings → Pages → Source: GitHub Actions**
4. Update `BASE_URL` in `.github/workflows/deploy.yml` to match your repo name
5. The included workflow auto-deploys on every push to `main`

Your site will be live at `https://yourusername.github.io/rights/`

The included `404.html` handles SPA routing for direct links.

### Custom Domain

1. Add a `CNAME` file to `/public` with your domain (e.g., `rights.example.org`)
2. Configure DNS: CNAME record pointing to `yourusername.github.io`
3. In repo Settings → Pages, add your custom domain
4. Enable "Enforce HTTPS"

## Project Structure

```
rights/
├── content/           # Markdown files (one per language)
│   ├── en.md         # English (canonical)
│   ├── es.md         # Spanish
│   ├── so.md         # Somali
│   └── hmn.md        # Hmong
├── public/
│   ├── 404.html      # SPA routing for GitHub Pages
│   └── pwa-*.svg     # PWA icons
├── src/
│   ├── App.tsx       # React app
│   └── index.css     # Styles (Tailwind + accessibility)
└── .github/
    └── workflows/    # Auto-deploy to GitHub Pages
```

## Tech Stack

- React 19 + TypeScript
- Vite 7 with vite-plugin-pwa
- Tailwind CSS 4
- react-markdown with rehype-raw
- qrcode.react for QR generation
- Workbox for offline caching

## About

A community project by [EK Institute](https://ekinstitute.org), a Minnesota-based non-profit. If you find this useful, consider [making a donation](https://www.ekinstitute.org/donate) to support our work.

## License

MIT — Built for community mutual aid.

## Disclaimer

This information is for educational purposes only and does not constitute legal advice.
