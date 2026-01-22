#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { createRequire } from 'module';
import { join, resolve } from 'path';

import { platformMapping } from './include/constants.mjs';

const require = createRequire(import.meta.url);

// Get the root directory of the project
const rootDir = resolve(import.meta.dirname, '..', '..');
const buildDir = join(rootDir, 'build');
const releaseDir = join(buildDir, 'release');
const npmDir = join(rootDir, 'npm');

console.log('Building NPM packages from release bundles...');

// Check if release directory exists
if (!existsSync(releaseDir)) {
  console.error('Error: Release directory not found. Please run the release-tiny build first:');
  console.error('  go run scripts/build.go --mode=release-tiny');
  process.exit(1);
}

// Get version from package.json
const npmVersion = require(join(npmDir, 'mutagen', 'package.json')).version;

// Convert NPM version (e.g., "0.19.0-dev.0") to Go version format (e.g., "0.19.0-dev")
// Remove the build number after the prerelease tag
const goVersion = npmVersion.replace(/(-[^.]+)\.\d+$/, '$1');

console.log(`NPM version: ${npmVersion}`);
console.log(`Go version: ${goVersion}`);

// Process each platform
for (const [goTarget, npmPlatform] of Object.entries(platformMapping)) {
  console.log(`\nProcessing ${npmPlatform}...`);

  // Find the release bundle
  const bundlePattern = `mutagen_${goTarget}_v${goVersion}.tar.gz`;
  const bundlePath = join(releaseDir, bundlePattern);

  if (!existsSync(bundlePath)) {
    console.error(`  Warning: Bundle not found: ${bundlePath}`);
    console.error(`  Skipping ${npmPlatform}`);
    continue;
  }

  // Prepare platform package bin directory
  const platformPackageDir = join(npmDir, `mutagen-${npmPlatform}`);
  const platformBinDir = join(platformPackageDir, 'bin');

  // Clean and recreate bin directory
  if (existsSync(platformBinDir)) {
    rmSync(platformBinDir, { recursive: true, force: true });
  }
  mkdirSync(platformBinDir, { recursive: true });

  // Extract bundle directly into bin directory
  console.log(`  Extracting ${bundlePattern}...`);
  try {
    execSync(`tar -xzf "${bundlePath}" -C "${platformBinDir}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`  Error extracting bundle: ${error.message}`);
    continue;
  }

  // Verify extracted files
  const binaryName = npmPlatform.startsWith('win32') ? 'mutagen.exe' : 'mutagen';
  const extractedBinary = join(platformBinDir, binaryName);
  const extractedAgentBundle = join(platformBinDir, 'mutagen-agents.tar.gz');

  if (!existsSync(extractedBinary)) {
    console.error(`  Error: Binary not found in extracted bundle: ${extractedBinary}`);
    continue;
  }

  if (!existsSync(extractedAgentBundle)) {
    console.error(`  Error: Agent bundle not found in extracted bundle: ${extractedAgentBundle}`);
    continue;
  }

  console.log(`  ✓ ${npmPlatform} package ready`);
}

console.log('\n✓ NPM packages built successfully');
console.log('\nTo publish packages:');
console.log('  node npm/scripts/publish.mjs');
console.log('  (use --dry-run to test without publishing)');
