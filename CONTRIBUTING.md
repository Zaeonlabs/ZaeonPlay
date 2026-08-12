# Contributing to StreamPlugins

Thank you for your interest in contributing to StreamPlugins. This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/StreamPlugins.git
   cd StreamPlugins
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. Follow the [Development Guide](docs/DEVELOPMENT.md) to set up your environment

## What to Contribute

### Good First Issues

Look for issues labeled `good first issue` on GitHub. These are intentionally scoped for new contributors.

### Feature Requests

Before starting work on a new feature:
1. Check existing issues and pull requests to avoid duplicates
2. Open an issue describing the feature and its use case
3. Wait for feedback from maintainers before investing significant time

### Bug Fixes

1. Open an issue describing the bug (if one doesn't exist)
2. Include steps to reproduce, expected behavior, and actual behavior
3. Reference the issue number in your pull request

## Code Style

### TypeScript (Server)

- Use TypeScript strict mode
- Prefer `const` over `let`; avoid `var`
- Use async/await over raw promises
- Use descriptive variable and function names
- Keep functions focused -- one function, one responsibility
- Handle errors explicitly; do not silently swallow exceptions

```typescript
// Preferred
async function fetchTwitchFollowers(broadcasterId: string): Promise<number> {
  const response = await twitchApi.get('/channels/followers', {
    params: { broadcaster_id: broadcasterId },
  });
  return response.data.total;
}

// Avoid
async function getFollowers(id: any) {
  try {
    const r = await fetch(`...${id}`);
    return (await r.json()).total;
  } catch (e) {}
}
```

### HTML/CSS/JS (Plugin Frontends)

- Vanilla JavaScript only -- no frameworks, no build step for frontends
- Use modern JS (ES2022+) -- OBS Browser Sources run Chromium
- CSS custom properties (variables) for theming -- defined in `plugins/shared/css/base.css`
- Semantic HTML structure
- Keep overlays lightweight -- minimize DOM nodes and avoid expensive CSS (blur, large box-shadows)
- All plugins must include `theme-loader.js` in `<head>` -- do NOT hardcode `data-theme` on the `<html>` element
- Use CSS custom properties from `base.css` for all styling -- do not hardcode colors
- Use the `.sp-card`, `.sp-btn-*`, `.sp-toggle`, and `.sp-fade-in` utility classes from the design system

### CSS Naming

Use BEM-style naming for CSS classes:
```css
.chat-message { }
.chat-message__username { }
.chat-message__content { }
.chat-message--twitch { }
.chat-message--youtube { }
.chat-message--kick { }
```

### Comments

Write comments only when the code's intent is not obvious. Do not narrate what the code does:

```typescript
// Bad: Increment the counter
counter++;

// Good: Rate limit requires at least 100ms between requests
await delay(Math.max(100, nextAllowedTime - Date.now()));
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat` -- new feature
- `fix` -- bug fix
- `docs` -- documentation changes
- `style` -- formatting, missing semicolons (not CSS changes)
- `refactor` -- code change that neither fixes a bug nor adds a feature
- `test` -- adding or updating tests
- `chore` -- build process, dependency updates, tooling

Scopes: `server`, `metrics`, `title-updater`, `alerts`, `chat`, `discord`, `native-plugin`, `tray-app`, `docs`, `viewer-count`, `goal-bars`, `donation-alerts`, `scene-reactions`, `webhooks`, `obs-websocket`, `themes`

Examples:
```
feat(chat): add Kick emote rendering support
fix(server): handle Twitch token refresh race condition
docs(api-reference): add YouTube quota cost details
chore(deps): update express to 4.21.0
feat(donation-alerts): add Stripe webhook handler
feat(scene-reactions): add rule builder UI
fix(webhooks): validate Ko-fi verification token
feat(themes): add Cyberpunk theme
```

## Pull Request Process

### Before Submitting

1. **Run tests**: `npm run test`
2. **Run linting**: `npm run lint`
3. **Run type checking**: `npm run typecheck`
4. **Test in OBS**: Verify your changes work in OBS Browser Sources/Docks
5. **Update documentation**: If your change affects user-facing behavior or APIs

### PR Template

When opening a pull request, include:

```markdown
## Summary
Brief description of what this PR does.

## Changes
- List of specific changes

## Testing
How you tested these changes (manual testing steps, automated tests added)

## Screenshots
If applicable, screenshots or recordings of UI changes

## Related Issues
Closes #123
```

### Review Process

1. All PRs require at least one maintainer review
2. CI must pass (tests, lint, typecheck, build)
3. Address review feedback by pushing additional commits (do not force-push during review)
4. Once approved, a maintainer will merge the PR

## Project Architecture

Understanding the codebase:

- **`server/`** -- Node.js backend handling OAuth, API proxying, WebSocket management, Discord forwarding. All TypeScript.
- **`server/src/webhooks/`** -- Payment webhook handlers (PayPal, Stripe, Ko-fi, BMC, Streamlabs)
- **`server/src/obswebsocket/`** -- OBS WebSocket v5 client for scene automation
- **`server/src/routes/webhooks.ts`** -- Express routes for incoming payment webhooks
- **`plugins/`** -- Frontend widgets loaded into OBS. Vanilla HTML/CSS/JS. Each plugin is a self-contained directory.
- **`plugins/shared/`** -- Common CSS variables, themes, API client, and WebSocket client shared across all plugins.
- **`plugins/shared/js/icons.js`** -- SVG icon library for platform logos
- **`plugins/shared/js/theme-loader.js`** -- Theme auto-loader included by every plugin
- **`plugins/viewer-count/`** -- Combined viewer count overlay
- **`plugins/goal-bars/`** -- Goal progress bar overlay + settings dock
- **`plugins/donation-alerts/`** -- Donation alert overlay + settings dock
- **`plugins/scene-reactions/`** -- OBS scene automation dock
- **`native-plugin/`** -- Thin C++ OBS plugin that starts the server and registers docks. Rarely needs changes.
- **`tray-app/`** -- System tray application for standalone mode.
- **`docs/`** -- Project documentation.

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system design.

## Adding a New Platform

To add support for a new streaming platform:

1. **Auth**: Add OAuth flow in `server/src/auth/newplatform.ts`
2. **API proxy**: Add API routes in `server/src/api/newplatform.ts`
3. **WebSocket**: If the platform has real-time events, add a client in `server/src/websockets/`
4. **Frontend**: Update each plugin's frontend to include the new platform's data
5. **Docs**: Update API-REFERENCE.md with the new platform's endpoints
6. **Tests**: Add tests for the new auth flow, API proxy, and WebSocket client

## Adding a New Plugin

To add a new plugin:

1. Create a new directory under `plugins/your-plugin-name/`
2. Add `index.html`, `style.css`, `script.js`
3. Include `theme-loader.js` in the `<head>` BEFORE other scripts
4. Include `icons.js` for SVG platform icons
5. Use the shared API client and WebSocket client from `plugins/shared/js/`
6. Use `showToast()` from `utils.js` for user feedback
7. If the plugin needs a settings dock, create `settings.html` alongside `index.html`
8. Add the plugin's URL to the server's static file routing
9. If it needs a dock, register it in `native-plugin/src/plugin-main.cpp`
10. Document it in `docs/PLUGIN-GUIDES.md`

## Adding a Webhook Handler

To add support for a new payment/donation platform:

1. Create a handler file in `server/src/webhooks/newplatform.ts`
2. Export an async handler function with signature: `(req: Request, res: Response, emit: (event: string, data: unknown) => void) => Promise<void>`
3. Validate the incoming payload (check signatures, tokens, etc.)
4. Normalize the payment data to the standard donation event format:
   ```typescript
   emit('donation', {
     source: 'newplatform',
     amount: number,
     currency: string,
     donor: string,
     message: string,
     timestamp: string, // ISO 8601
   });
   ```
5. Register the route in `server/src/routes/webhooks.ts`
6. Add the platform's settings (API keys, secrets) to the Donation Alerts settings dock
7. Update API-REFERENCE.md with the new webhook endpoint
8. Add tests in `server/src/webhooks/__tests__/`

## Code of Conduct

Be respectful and constructive in all interactions. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

## Questions?

- Open a GitHub Discussion for general questions
- Open a GitHub Issue for bugs or feature requests
- Join the community Discord for real-time discussion

## License

By contributing to StreamPlugins, you agree that your contributions will be licensed under the [MIT License](LICENSE).
