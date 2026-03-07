/**
 * lint-staged configuration — cross-platform (Windows + Linux/Mac)
 *
 * WHY THIS FILE EXISTS:
 * The original config in package.json used `cd backend && npm run lint --fix`
 * which has two bugs on Windows:
 *   1. `cd dir &&` doesn't change working directory in lint-staged's shell context on Windows
 *   2. `npm run lint` expands a glob ({src,apps,libs,test}/**\/*.ts) that lints ALL
 *      files in the project, not just the staged ones
 *
 * FIX:
 *   - Use `node path/to/eslint.js` (cross-platform, no .cmd/.sh issues)
 *   - Pass staged files directly to ESLint (bypassing the npm script glob)
 *   - Use explicit --config flag so ESLint finds the right config regardless of cwd
 *
 * NOTE: import.meta.dirname in backend/eslint.config.mjs always resolves to
 * the backend/ directory (it's a property of the config FILE location, not cwd),
 * so TypeScript projectService correctly finds backend/tsconfig.json even when
 * ESLint is invoked from the repo root.
 */

import { resolve } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('.', import.meta.url));

const backendEslint = resolve(root, 'backend/node_modules/eslint/bin/eslint.js');
const backendConfig = resolve(root, 'backend/eslint.config.mjs');

export default {
  // Backend: invoke eslint.js directly via node — no `cd`, no glob expansion
  'backend/**/*.{ts,js}': (files) => {
    const fileList = files.map((f) => `"${f}"`).join(' ');
    return `node "${backendEslint}" --config "${backendConfig}" --fix ${fileList}`;
  },

  // Frontend: eslint is at frontend/node_modules after `npm install` in frontend/
  // next lint handles Next.js-specific rules; --file flag lints individual files
  'frontend/**/*.{ts,tsx,js,jsx}': (files) => {
    const frontendNext = resolve(root, 'frontend/node_modules/.bin/next');
    return files.map((f) => `node "${frontendNext}" lint --fix --file "${f}"`);
  },

  // Markdown: prettier is installed at root devDependencies
  '*.md': 'prettier --write',
};
