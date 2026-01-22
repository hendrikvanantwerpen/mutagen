#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { createRequire } from 'module';
import { join, resolve } from 'path';

import { platformPackages, mainPackage } from './include/constants.mjs';

const require = createRequire(import.meta.url);

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-N');

// Get the root directory of the project
const rootDir = resolve(import.meta.dirname, '..', '..');
const npmDir = join(rootDir, 'npm');

console.log(dryRun ? 'DRY RUN: No packages will be published\n' : 'Publishing NPM packages...\n');

function publishPackage(packageName) {
  const packageDir = join(npmDir, packageName);

  if (!existsSync(packageDir)) {
    console.error(`Error: Package directory not found: ${packageDir}`);
    return false;
  }

  const packageJsonPath = join(packageDir, 'package.json');
  if (!existsSync(packageJsonPath)) {
    console.error(`Error: package.json not found in ${packageDir}`);
    return false;
  }

  const packageJson = require(packageJsonPath);
  console.log(`Publishing @nuanced-dev/${packageName}@${packageJson.version}...`);

  try {
    const cmd = dryRun ? 'npm publish --tag latest --dry-run' : 'npm publish --tag latest';
    execSync(cmd, {
      cwd: packageDir,
      stdio: 'inherit',
    });
    console.log(`  ✓ @nuanced-dev/${packageName} published successfully\n`);
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to publish @nuanced-dev/${packageName}`);
    console.error(`  Error: ${error.message}\n`);
    return false;
  }
}

// Publish platform packages first
console.log('Publishing platform-specific packages...\n');
let failed = false;

for (const pkg of platformPackages) {
  if (!publishPackage(pkg)) {
    failed = true;
    break;
  }
}

if (failed) {
  console.error('\nPublishing stopped due to errors.');
  process.exit(1);
}

// Publish main package last
console.log('Publishing main package...\n');
if (!publishPackage(mainPackage)) {
  console.error('\nFailed to publish main package.');
  process.exit(1);
}

console.log(dryRun ? '\n✓ Dry run completed successfully' : '\n✓ All packages published successfully');
