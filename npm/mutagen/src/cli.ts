#!/usr/bin/env node

import console from "node:console";
import process from "node:process";

import { mutagenSync } from './index.js';

const result = mutagenSync(process.argv.slice(2), { stdio: 'inherit' });

if (result.error) {
  console.error(`Failed to execute mutagen: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 0);
