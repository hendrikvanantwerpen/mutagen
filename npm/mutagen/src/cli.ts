#!/usr/bin/env node

import console from "node:console";
import process from "node:process";

import { MutagenError, mutagenSync } from './index.js';

try {
    const o = mutagenSync(process.argv.slice(2));
    console.log(o.stdout);
} catch (e) {
    const me = e as MutagenError;
    console.error(me.stderr);
    process.exitCode = me.exitCode;
}
