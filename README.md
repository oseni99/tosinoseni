# Tosin Oseni — Personal Website

A personal portfolio sharing my work, experience, projects, and interests. Built with Astro, TypeScript, and Tailwind CSS, the site combines a focused reading layout with an animated water background and a small browser game.

## Features

- **Home:** introduction, current interests, professional experience, selected projects, and hackathon results with expandable photos.
- **Elsewhere:** résumé, coding practice, PlayStation details, a space for future notes, and Stack Snake.
- **Responsive layout:** mobile and desktop layouts with compact typography and locally hosted fonts.
- **Water background:** a custom WebGL shader that respects reduced-motion preferences and pauses when the tab is hidden, with a static CSS fallback when WebGL is unavailable.
- **Progressive enhancement:** core content, navigation, résumé access, and photo disclosure work without JavaScript. Animation and the game enhance the experience when JavaScript is available.

The site generates static files and requires no database, CMS, API keys, or backend service. No analytics are configured.

## Technology

| Technology | Purpose |
| --- | --- |
| Astro | Static pages, shared layouts, and components |
| TypeScript | Content data, game logic, and background rendering |
| Tailwind CSS | Responsive styles and theme tokens |
| WebGL | Animated water effect without an animation library |
| Playwright | Browser tests and layout screenshots |
| Fontsource | Locally hosted DM Sans and Instrument Serif fonts |

Dependency versions are defined in [package.json](package.json) and resolved in [package-lock.json](package-lock.json).

## Local Development

### Requirements

- Node.js **22.12.0 or later**
- npm **9.6.5 or later**

### Start the site

```sh
npm install
npm run dev
```

Open [http://127.0.0.1:4321](http://127.0.0.1:4321). Changes to source files reload during development. No environment variables are required.

### Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run check` | Run Astro and TypeScript diagnostics |
| `npm run build` | Run diagnostics and generate the static site in `dist/` |
| `npm run preview` | Serve the latest production build locally |
| `npm test` | Run the Playwright browser tests |

## Project Structure

```text
public/
  icons/                 Organization icons
  images/                Hackathon photos
  tosinoseni.pdf         Downloadable résumé
src/
  components/            Water background and Stack Snake UI
  data/profile.ts        Personal copy, experience, projects, and links
  layouts/Layout.astro   Shared document, navigation, metadata, and footer
  pages/index.astro      Home page
  pages/elsewhere.astro  Résumé, interests, notes, and game access
  scripts/               Water rendering and game behavior
  styles/global.css     Fonts, theme tokens, and global styles
tests/site.spec.ts       Browser coverage and screenshot capture
astro.config.mjs        Static output and Tailwind configuration
playwright.config.ts    Browser and local test server configuration
```

## Updating Content

| Change | Location |
| --- | --- |
| Bio, current interests, experience, projects, hackathons, contact links, or PSN | [src/data/profile.ts](src/data/profile.ts) |
| Home page headings, section spacing, or layout | [src/pages/index.astro](src/pages/index.astro) |
| Elsewhere copy, notes, or sections | [src/pages/elsewhere.astro](src/pages/elsewhere.astro) |
| Navigation, metadata, or footer | [src/layouts/Layout.astro](src/layouts/Layout.astro) |
| Colors, fonts, or global styles | [src/styles/global.css](src/styles/global.css) |
| Résumé | Replace [public/tosinoseni.pdf](public/tosinoseni.pdf) |
| Organization icons or photos | [public/icons/](public/icons/) and [public/images/](public/images/) |

Files in `public/` are served from the site root. For example, `public/tosinoseni.pdf` is available at `/tosinoseni.pdf`. Edit source files and rebuild; `dist/` contains generated output.

## Stack Snake

Open the game using **Play Stack Snake** on Elsewhere. A clickable snake also crosses the screen after 60 seconds of visible browsing on either page, once per browser tab session when session storage is available. The delay applies in both development and production. Hidden tabs pause the countdown; navigating to another page starts a new countdown if the teaser has not appeared yet.

Collect technologies while avoiding walls and the snake’s body. Use the arrow keys or WASD to steer, Space to pause or resume, and the on-screen arrows on touch devices. The game pauses when the window loses focus or the tab becomes hidden.

Reduced-motion preferences suppress the crossing animation; the Elsewhere button remains available. The best score is stored locally in the browser when storage is available. Game logic lives in [src/scripts/stack-snake.ts](src/scripts/stack-snake.ts), and the interface and animation styles live in [src/components/StackSnake.astro](src/components/StackSnake.astro).

## Testing

Install the Chromium browser used by Playwright, then run the suite:

```sh
npx playwright install chromium
npm test
```

Playwright starts the local development server automatically and reuses an existing server outside CI. Tests cover navigation, key content and links, résumé access, reduced-motion behavior, content without JavaScript, mobile overflow, and the game’s controls and timed teaser. Layout checks include viewport widths of 320, 390, and 1440 pixels.

Screenshots and failure artifacts are written to `test-results/`, which is excluded from version control. The configuration also supports `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for environments that need to supply an existing browser executable; the Playwright-managed Chromium installation is the default.

## Production Build

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static hosting service. For hosts that build from the repository, use `npm run build` as the build command and `dist` as the publish directory. Configure the host to serve directory index pages, including `/elsewhere/`.

The preview server serves the most recent build. Rebuild after source changes to update the preview. See the [Astro build guide](https://docs.astro.build/en/guides/develop-and-build/) for the development and production workflow.

## Assets and Credits

- Typography: DM Sans and Instrument Serif, bundled through Fontsource.
- Salesforce icon: Simple Icons v11 (CC0).
- Microsoft icon: the Microsoft four-square mark.
- Talladega College icon: sourced from the [college’s official website](https://www.talladega.edu/).
- Hackathon photos and résumé: personal portfolio assets supplied by Tosin Oseni.

For browser installation and testing options, see the [Playwright documentation](https://playwright.dev/docs/browsers).
