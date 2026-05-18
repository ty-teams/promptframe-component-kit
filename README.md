# PromptFrame Component Kit

Public source repository for `@promptframe/component-kit`, a small TypeScript helper package for building PromptFrame-compatible Remotion components.

```bash
npm install @promptframe/component-kit
```

The package provides version stamps, preview constraints, and deterministic timing helpers. Component projects can depend on it during authoring; finished components are packaged and uploaded with the PromptFrame CLI.

## Local Checks

```bash
pnpm install --frozen-lockfile
pnpm --filter @promptframe/component-kit test
pnpm --filter @promptframe/component-kit lint
pnpm --filter @promptframe/component-kit build
cd packages/component-kit && npm pack --dry-run --json
```

## Releases

`@promptframe/component-kit` is published to the public npm registry. Releases are signed through npm Trusted Publishing from GitHub Actions.

Release configuration:

- npm package: `@promptframe/component-kit`
- GitHub repo: `ty-teams/promptframe-component-kit`
- Workflow file: `publish-component-kit.yml`
- Environment: `npm-production`

To publish a new version, bump the package version, run local checks, push a `component-kit-vX.Y.Z` tag, and verify npm registry output after the workflow completes.
