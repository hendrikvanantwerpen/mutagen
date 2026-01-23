import { spawn, SpawnOptionsWithoutStdio, spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { createRequire } from 'module';
import { platform, arch } from 'os';
import { join } from 'path';

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

interface MutagenOptions {
    env: Record<string, string>,
}

/**
 * Execute mutagen synchronously with the given arguments
 *
 * @param args - Command-line arguments to pass to mutagen
 * @param options - Options to pass to the process
 * @returns A {@link MutagenResult} with the output of the process
 * @throws A {@link MutagenError} with the exit code and error
 */
export function mutagenSync(args: string[], options?: MutagenOptions): MutagenResult {
    const binaryPath = getPlatformBinary();
    const res = spawnSync(binaryPath, args, {
        encoding: "utf8",
        ...options
    });
    if (res.status) {
        throw new MutagenError(res.status, res.stderr);
    }
    return { stdout: res.stdout };
}

/**
 * Execute mutagen asynchronously with the given arguments
 *
 * @param args - Command-line arguments to pass to mutagen
 * @param options - Options to pass to the process
 * @returns A {@link MutagenResult} with the output of the process
 * @throws A {@link MutagenError} with the exit code and error
 */
export async function mutagen(args: string[], options?: MutagenOptions): Promise<MutagenResult> {
    const binaryPath = getPlatformBinary();
    return spawnAsync(binaryPath, args, options);
}

async function spawnAsync(cmd: string, args: string[], options?: SpawnOptionsWithoutStdio): Promise<MutagenResult> {
    const child = spawn(cmd, args, options);

    let stdout = "";
    child.stdout.on('data', (data) => stdout += data);

    let stderr = "";
    child.stderr.on('data', (data) => stderr += data);

    const exitCode: number = await new Promise((resolve, reject) => {
        child.on('close', resolve);
    });

    if (exitCode) {
        throw new MutagenError(exitCode, stderr);
    }

    return { stdout };
}

export interface MutagenResult {
    stdout: string;
}

export class MutagenError extends Error {
    constructor(
        public exitCode: number,
        public stderr: string,
    ) {
        super(`process exited with code ${exitCode}`);
    }
}
