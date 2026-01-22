import { spawnSync } from 'child_process';
import { spawn } from 'child-process-promise';
import { existsSync } from 'fs';
import { createRequire } from 'module';
import { platform, arch } from 'os';
import { join } from 'path';

import type {
    ChildProcess,
    SpawnOptions,
    SpawnSyncOptions,
    SpawnSyncReturns,
} from 'child_process';
import type {
    ChildProcessPromise,
    SpawnPromiseResult,
} from 'child-process-promise';

const require = createRequire(import.meta.filename);

/**
 * Gets the path to the platform-specific mutagen binary.
 * @throws {Error} If the platform is not supported or binary is not found
 * @returns The absolute path to the mutagen binary
 */
function getPlatformBinary(): string {
    const packageName = `@nuanced-dev/mutagen-${platform()}-${arch()}`;

    try {
        const packagePath = require.resolve(`${packageName}/package.json`);
        const binDir = join(packagePath, '..', 'bin');
        const binaryName = platform() === 'win32' ? 'mutagen.exe' : 'mutagen';
        const binaryPath = join(binDir, binaryName);

        if (!existsSync(binaryPath)) {
            throw new Error(`Mutagen binary not found at ${binaryPath}`);
        }

        return binaryPath;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
            `Mutagen does not support this platform ${platform()}-${arch()}. ` +
            `Supported platforms: darwin-x64, darwin-arm64, linux-x64, linux-arm64, win32-x64, win32-arm64. ` +
            `Original error: ${message}`
        );
    }
}

/**
 * Execute mutagen asynchronously with the given arguments (uses child-process-promise.spawn).
 *
 * @param args - Command-line arguments to pass to mutagen
 * @param options - Options to pass to child-process-promise.spawn()
 * @returns The spawned child process
 */
export async function mutagen(args: string[] = [], options: SpawnOptions = {}): Promise<ChildProcessPromise<SpawnPromiseResult>> {
    const binaryPath = getPlatformBinary();
    return spawn(binaryPath, args, options);
}

/**
 * Execute mutagen synchronously with the given arguments (uses child_process.spawnSync).
 *
 * @param args - Command-line arguments to pass to mutagen
 * @param options - Options to pass to child_process.spawnSync()
 * @returns The result of the synchronous spawn
 */
export function mutagenSync(args: string[] = [], options: SpawnSyncOptions = {}): SpawnSyncReturns<Buffer | string> {
    const binaryPath = getPlatformBinary();
    return spawnSync(binaryPath, args, options);
}
