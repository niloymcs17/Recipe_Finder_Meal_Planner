# Publishing `@recipe-finder/ui` to npm

This guide is for **maintainers** of the monorepo who need to publish the Stencil UI library (`packages/recipe-ui`) to the public npm registry.

For **consumers** of the package (install, usage, components), see [packages/recipe-ui/readme.md](../packages/recipe-ui/readme.md).

---

## Overview

| Item | Value |
| --- | --- |
| Package name | `@recipe-finder/ui` |
| Package path | `packages/recipe-ui/` |
| npm org | [`recipe-finder`](https://www.npmjs.com/org/recipe-finder) |
| Registry | `https://registry.npmjs.org/` |
| Access | Public (scoped package) |

Day-to-day monorepo development uses workspace linking:

```json
"@recipe-finder/ui": "workspace:*"
```

Publishing is only needed when external projects (or assignment graders outside the monorepo) should install the library from npm instead of building from source.

---

## Prerequisites

1. **Node.js 20+** and **pnpm 9+** (same as the monorepo)
2. An **npm account** — [sign up](https://www.npmjs.com/signup) if you do not have one
3. **Membership** in the `@recipe-finder` npm organization (owner or developer with publish rights)
4. **Two-factor authentication (2FA)** enabled on your npm account, *or* a **granular access token** with publish permission (see [Auth](#authentication))

Verify your login:

```bash
npm whoami
```

Verify org access:

```bash
npm org ls recipe-finder
```

---

## What gets published

The Stencil build produces the artifacts consumers need:

| Path | Purpose |
| --- | --- |
| `dist/` | Library bundle, custom elements, types |
| `dist/components/` | Custom element definitions (main export) |
| `loader/` | Lazy `defineCustomElements` loader |
| `dist/recipe-ui/recipe-ui.css` | Global theme (`@recipe-finder/ui/global.css`) |

Always **build before publish**. npm ships whatever is on disk in `dist/` and `loader/` at publish time.

---

## Pre-publish checklist

- [ ] All changes are committed (optional but recommended)
- [ ] Tests pass: `pnpm --filter @recipe-finder/ui test`
- [ ] Production build succeeds: `pnpm --filter @recipe-finder/ui build`
- [ ] Version bumped in `packages/recipe-ui/package.json` (cannot republish the same version)
- [ ] Logged in to npm (`npm whoami`) or token configured
- [ ] No secrets in the tarball (no `.env`, no hardcoded tokens in source)

---

## Publish workflow

### Step 1 — Build

From the **monorepo root**:

```bash
pnpm --filter @recipe-finder/ui build
```

Or from the package directory:

```bash
cd packages/recipe-ui
pnpm build
```

Confirm `dist/` and `loader/` exist and are up to date.

### Step 2 — Bump the version

Edit `version` in `packages/recipe-ui/package.json`, or use npm’s version helper:

```bash
cd packages/recipe-ui
npm version patch   # 0.1.0 → 0.1.1
# npm version minor   # 0.1.0 → 0.2.0
# npm version major   # 0.1.0 → 1.0.0
```

Follow [semver](https://semver.org/) while the API is unstable (`0.x`).

### Step 3 — Dry run (optional)

Inspect the tarball without uploading:

```bash
cd packages/recipe-ui
npm publish --dry-run
```

Review the file list and package size. Fix any missing `dist/` output before continuing.

### Step 4 — Publish

```bash
cd packages/recipe-ui
npm publish --access public
```

`--access public` is redundant if `publishConfig.access` is set, but safe to include explicitly.

### Step 5 — Verify

```bash
npm view @recipe-finder/ui
npm view @recipe-finder/ui version
```

Open the registry page: [npmjs.com/package/@recipe-finder/ui](https://www.npmjs.com/package/@recipe-finder/ui)

Test install in a clean folder:

```bash
mkdir /tmp/rf-ui-test && cd /tmp/rf-ui-test
npm init -y
npm install @recipe-finder/ui
```

---

## Authentication

### Option A — Interactive login + 2FA

```bash
npm login
npm whoami
cd packages/recipe-ui
npm publish --access public
```

When prompted, enter your npm password and the **6-digit OTP** from your authenticator app.

If npm asks for OTP during publish without a login prompt:

```bash
npm publish --access public --otp=123456
```

### Option B — Granular access token (automation / CI)

Best for repeat publishes without typing OTP each time.

#### Create the token

1. Go to [npm Access Tokens](https://www.npmjs.com/settings/~account/tokens)
2. **Generate New Token** → **Granular Access Token**
3. Configure:
   - **Token name:** e.g. `recipe-finder-publish`
   - **Expiration:** as needed
   - **Packages and scopes:** `@recipe-finder/*`
   - **Permissions:** Read and write
   - **Organizations:** `recipe-finder`
4. Enable **Bypass 2FA** if the option is available (required for non-interactive publish on some accounts)
5. Copy the token immediately — npm shows it only once

#### Store the token (never commit it)

Add `packages/recipe-ui/.npmrc` to `.gitignore` (already configured in this repo).

**Recommended — environment variable:**

Create `packages/recipe-ui/.npmrc` locally:

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

Set the variable before publishing:

```powershell
# PowerShell (Windows)
$env:NPM_TOKEN = "npm_xxxxxxxxxxxxxxxx"
cd packages/recipe-ui
npm publish --access public
```

```bash
# bash / macOS / Linux
export NPM_TOKEN=npm_xxxxxxxxxxxxxxxx
cd packages/recipe-ui
npm publish --access public
```

**Alternative — user-level config:**

Add the token to `~/.npmrc` (outside the repo):

```ini
//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxxxxxx
```

#### Revoke compromised tokens

If a token is exposed (committed to git, pasted in chat, etc.):

1. Revoke it immediately on [npm tokens settings](https://www.npmjs.com/settings/~account/tokens)
2. Generate a new token
3. Update your local `.npmrc` or env var

---

## Monorepo vs published package

| Audience | Dependency | What to run |
| --- | --- | --- |
| Monorepo developers | `"@recipe-finder/ui": "workspace:*"` | `pnpm build` from repo root |
| External consumers | `"@recipe-finder/ui": "^0.1.0"` | `npm install @recipe-finder/ui` |
| Graders with full repo clone | `workspace:*` | `pnpm install && pnpm build` — **no publish required** |

Publishing does **not** change local workspace behavior. `apps/web` continues to resolve the local package via `workspace:*` unless you deliberately switch it to a semver range from npm.

---

## Releasing a new version (summary)

```bash
# From monorepo root
pnpm --filter @recipe-finder/ui test
pnpm --filter @recipe-finder/ui build

cd packages/recipe-ui
npm version patch          # bump version + optional git tag
npm publish --dry-run      # optional sanity check
npm publish --access public

npm view @recipe-finder/ui version
```

---

## Troubleshooting

| Error | Likely cause | Fix |
| --- | --- | --- |
| `403` — Two-factor authentication required | 2FA not enabled or token lacks bypass | Enable 2FA or use granular token with bypass; try `--otp=XXXXXX` |
| `403` — Forbidden | No org publish permission | Confirm `npm org ls recipe-finder`; check token scope |
| `402 Payment Required` | Scoped package treated as private | Use `--access public` or `publishConfig.access` |
| `npm ERR! private` | `"private": true` in package.json | Remove or set `"private": false` |
| `EPUBLISHCONFLICT` | Version already exists on npm | Bump `version` in package.json |
| Empty or broken package on npm | Forgot to build | Run `pnpm --filter @recipe-finder/ui build` before publish |
| `404` on `npm view` after publish | Registry propagation delay | Wait a minute and retry |
| Wrong files in tarball | Stale `dist/` | Clean rebuild: delete `dist/` and `loader/`, then `pnpm build` |

---

## CI/CD (optional)

Example GitHub Actions pattern:

```yaml
- run: pnpm --filter @recipe-finder/ui build
- run: npm publish --access public
  working-directory: packages/recipe-ui
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Store `NPM_TOKEN` as a repository secret (granular token with `@recipe-finder/*` write access). Do not log the token in CI output.

---

## Related docs

- Consumer usage: [packages/recipe-ui/readme.md](../packages/recipe-ui/readme.md)
- Monorepo setup and scripts: [README.md](../README.md)
