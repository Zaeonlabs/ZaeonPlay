# ZaeonPlay (StreamPlugins) Workspace Guidelines

Welcome to the ZaeonPlay (StreamPlugins) monorepo. This project provides multi-platform streaming tools and OBS Studio integrations for Twitch, YouTube, and Kick.

---

## Workspace Structure & Architecture

- **`server/`**: Node.js & TypeScript backend handling API endpoints, OAuth authentication (Twitch, YouTube, Kick), WebSockets, Discord webhooks, payment webhooks (Stripe, PayPal, Ko-fi), and OBS WebSocket v5 connection.
- **`plugins/`**: Vanilla HTML, CSS, and JS plugin frontends serving as OBS Studio dock panels or transparent browser-source overlays.
- **`tray-app/`**: Standalone desktop tray application wrapping the backend server.
- **`scripts/`**: Build and packaging scripts for OBS plugin bundles and installers.
- **`docs/`**: Comprehensive API reference, architecture docs, and user guides.

---

## Coding Standards & Conventions

### Backend (TypeScript & Node.js)
- **Engine**: Node.js `>=22.0.0`, npm `>=10.0.0`.
- **Strict TypeScript**: TypeScript strict mode is enabled. Explicitly define types and interfaces; avoid `any`.
- **Promises & Async**: Use `async/await` exclusively over raw `.then()` chains.
- **Error Handling**: Always catch and explicitly handle errors. Never swallow exceptions silently.
- **Immutability**: Prefer `const` over `let`. Avoid `var` entirely.
- **Architecture**: Keep functions modular and focused on a single responsibility.

### Plugin Frontends (HTML, CSS, Vanilla JS)
- **Vanilla JavaScript**: Modern ES2022+ vanilla JavaScript. No heavy frontend frameworks or build tools for plugin pages.
- **Theme System**: Every plugin HTML page **MUST** include `<script src="../shared/js/theme-loader.js"></script>` inside the `<head>` tag. Never hardcode `data-theme` directly on `<html>`.
- **CSS Variables & Design System**: Use CSS custom properties defined in `plugins/shared/css/base.css` (e.g. `--sp-bg-primary`, `--sp-text-color`).
- **Utility Classes**: Utilize `.sp-card`, `.sp-btn-*`, `.sp-toggle`, and `.sp-fade-in` utility classes.
- **BEM Naming**: Follow BEM-style CSS naming (`.chat-message__username`, `.chat-message--twitch`).
- **Performance Optimization**: Keep overlays lightweight! Minimize DOM node depth and avoid costly operations (excessive CSS blur, large drop shadows, complex animations) to ensure 60fps performance in OBS Browser Sources.

---

## Common Verification Commands

- `npm run dev` — Start the local development server on `http://localhost:3847`
- `npm run build` — Build the backend server and tray app
- `npm run test` — Run backend unit and integration test suite
- `npm run typecheck` — Run TypeScript type checking on the backend workspace
- `npm run lint` — Run ESLint across TypeScript and JavaScript files
- `npm run lint:fix` — Automatically fix lint errors
