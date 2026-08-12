/**
 * StreamPlugins Build Script
 *
 * Builds the server TypeScript code and bundles it with frontend plugin files
 * into a distributable package.
 *
 * Usage: node scripts/build.js
 *
 * Steps:
 * 1. Compile server TypeScript with esbuild
 * 2. Copy plugin frontend files to dist/plugins/
 * 3. Optionally compile to standalone binary with pkg
 */

import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');

console.log('[Build] Cleaning dist/...');
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

console.log('[Build] Building server...');
execSync('npm run build --workspace=server', { cwd: ROOT, stdio: 'inherit' });

console.log('[Build] Copying plugin files...');
cpSync(path.join(ROOT, 'plugins'), path.join(DIST, 'plugins'), { recursive: true });

console.log('[Build] Done. Output in dist/');
