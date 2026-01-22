# Mutagen NPM Packages

This directory contains the NPM package distribution for Mutagen.

## Package Structure

The NPM distribution consists of:

1. **Top-level package** (`mutagen/`): `@nuanced-dev/mutagen`

   - Main package that users install
   - Provides CLI command: `nuanced-mutagen`
   - Provides programmatic API
   - Has optional dependencies on all platform-specific packages

2. **Platform-specific packages** (`mutagen-OS-PLATFORM/`): `@nuanced-dev/mutagen-OS-PLATFORM`

Each platform package contains:

- `bin/mutagen` (or `bin/mutagen.exe` on Windows)
- `bin/mutagen-agents.tar.gz`

## Building NPM Packages

To build the NPM packages from source:

1. **Build release bundles (in the repo root):**

   ```bash
   go run scripts/build.go --mode=release-tiny
   ```

2. **Populate NPM packages:**

   ```bash
   scripts/build.js
   ```

This will extract the release bundles and copy the binaries into the appropriate platform package directories.

## Publishing

To publish the packages to NPM:

```bash
scripts/publish.js
```

To test without actually publishing:

```bash
scripts/publish.js --dry-run
```

The publish script will automatically:

1. Publish all platform-specific packages first
2. Publish the top-level package last

## Version Management

All packages use the same version number, which is derived from `pkg/mutagen/version.go`. When updating the version:

1. Update the version in `pkg/mutagen/version.go`
2. Update the version in all `package.json` files:
   - `npm/mutagen/package.json`
   - `npm/mutagen-*/package.json`
3. Also update the version in the `optionalDependencies` section of `npm/mutagen/package.json`
