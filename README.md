# Cupboard Warehouse — Kitchen Remodeling

A static marketing website for **Cupboard Warehouse**, a kitchen remodeling
company. The site pairs a proven **conversion architecture** with a polished
**visual design language**, rebranded for the kitchen-remodeling niche.

## How it was built

- **Conversion framework (structure):** the full section sequence, forms, trust
  components and conversion elements are modelled on the master template —
  replicated section-for-section, not simplified.
- **Visual design language:** typography, spacing, navy-gradient hero cards,
  green/blue accents, rounded cards, two-tone headings, icon rows, stat bands,
  parallax-style overlays and section dividers are drawn from the inspiration
  reference site.
- **Brand:** colours come straight from the brand logo — deep **navy**
  (`#191245`), signal **blue** (`#1b75bb`) and leaf **green** (`#58a618`).

## Pages

| Page | Purpose |
|------|---------|
| `index.html` | Home — 12 sections in exact sequence (hero + lead form, reviews, founder/about, services, why-us, gallery, 4-step process, financing/offers, blog, FAQ, service areas + stats, final CTA form) |
| `about.html` | Founder story, values, stats |
| `services.html` | Service overview grid + 7 detailed service blocks |
| `gallery.html` | Filterable project gallery |
| `financing.html` | Free design + 0% finance options + FAQ |
| `blog.html` | Featured article + post grid |
| `contact.html` | Lead form + contact info + FAQ |
| `service-areas.html` | Towns covered + coverage stats |

## Homepage section sequence (conversion architecture)

1. Hero + inline lead-capture form
2. Reviews / social proof
3. About / founder
4. Services (marquee + grid)
5. Why us (differentiators)
6. Gallery
7. Process (4 steps)
8. Financing / offers
9. Blog
10. FAQ
11. Service areas + stats
12. Final CTA form

## Assets — 100% local, zero external calls

Everything is self-hosted under `assets/`:

```
assets/
  styles.css      Full design system
  main.js         Mobile nav, gallery filter, demo form handling
  favicon.png
  fonts/          Oswald (headings) + Inter (body), self-hosted woff2
  img/            Decorative pattern
```

Fonts, CSS, JS and SVG iconography are bundled — no CDN, no tracking, no
external network requests at runtime. Imagery is rendered with brand-coloured
gradients and inline SVG so the site is fully self-contained.

## Run locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```
