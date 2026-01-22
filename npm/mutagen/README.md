# @nuanced-dev/mutagen

Fast file synchronization and network forwarding for remote development.

This is an NPM wrapper for [Mutagen](https://github.com/mutagen-io/mutagen), providing easy installation and usage in Node.js projects.

## Installation

```bash
npm install @nuanced-dev/mutagen
```

The package will automatically install the appropriate platform-specific binary for your system.

## Supported Platforms

Hosts:

- macOS (x64, arm64)
- Linux (x64, arm64)
- Windows (x64, arm64)

Targets:

- Linux (x64, arm64)

## CLI Usage

After installation, you can use the `nuanced-mutagen` command:

```bash
# Check version
npx nuanced-mutagen version

# Create a sync session
npx nuanced-mutagen sync create /path/to/source user@host:/path/to/destination

# List sync sessions
npx nuanced-mutagen sync list

# Get help
npx nuanced-mutagen help
```

## Programmatic Usage

This package is written in TypeScript and provides full type definitions. You can use Mutagen programmatically in your Node.js/TypeScript projects.

### Asynchronous API (spawn-based)

Use the default export `mutagen` for asynchronous execution (uses `child_process.spawn`):

```typescript
import mutagen from '@nuanced-dev/mutagen';

// Execute mutagen asynchronously and pipe output to current process
const proc = mutagen(['version'], { stdio: 'inherit' });

proc.on('exit', (code) => {
  console.log(`Exited with code ${code}`);
});
```

### Synchronous API (spawnSync-based)

Use the named export `mutagenSync` for synchronous execution (uses `child_process.spawnSync`):

```typescript
import { mutagenSync } from '@nuanced-dev/mutagen';

// Execute mutagen synchronously
const result = mutagenSync(['version'], { encoding: 'utf-8' });

if (result.status === 0) {
  console.log(result.stdout);
} else {
  console.error(result.stderr);
}
```

### Examples

**Capture output asynchronously:**

```typescript
import mutagen from '@nuanced-dev/mutagen';

const proc = mutagen(['sync', 'list'], { stdio: 'pipe' });

let output = '';
proc.stdout?.on('data', (data) => {
  output += data.toString();
});

proc.on('exit', (code) => {
  if (code === 0) {
    console.log('Sync sessions:', output);
  } else {
    console.error('Failed to list sync sessions');
  }
});
```

**Using async/await with promises:**

```typescript
import mutagen from '@nuanced-dev/mutagen';

function execMutagen(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = mutagen(args, { stdio: 'pipe' });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => stdout += data);
    proc.stderr?.on('data', (data) => stderr += data);

    proc.on('exit', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Mutagen exited with code ${code}: ${stderr}`));
      }
    });
  });
}

async function main() {
  try {
    const version = await execMutagen(['version']);
    console.log('Mutagen version:', version.trim());
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
}

main();
```

**Simple synchronous execution:**

```typescript
import { mutagenSync } from '@nuanced-dev/mutagen';

const result = mutagenSync(['sync', 'list'], { encoding: 'utf-8' });

if (result.status === 0) {
  console.log('Sync sessions:');
  console.log(result.stdout);
} else {
  console.error('Failed to list sync sessions');
  console.error(result.stderr);
}
```

## API

### `mutagen(args, options)` (default export)

Execute mutagen asynchronously with the given arguments (uses `child_process.spawn`).

**Parameters:**

- `args` (`string[]`, optional): Command-line arguments to pass to mutagen. Default: `[]`
- `options` (`SpawnOptions`, optional): Options to pass to [`child_process.spawn()`](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options). Default: `{}`

**Returns:**

- `ChildProcess`: The spawned child process

The function returns a Node.js [ChildProcess](https://nodejs.org/api/child_process.html#class-childprocess) object, giving you full control over:
- Standard input (`proc.stdin`)
- Standard output (`proc.stdout`)
- Standard error (`proc.stderr`)
- Exit events (`proc.on('exit', ...)`)
- And all other ChildProcess features

### `mutagenSync(args, options)` (named export)

Execute mutagen synchronously with the given arguments (uses `child_process.spawnSync`).

**Parameters:**

- `args` (`string[]`, optional): Command-line arguments to pass to mutagen. Default: `[]`
- `options` (`SpawnSyncOptions`, optional): Options to pass to [`child_process.spawnSync()`](https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options). Default: `{}`

**Returns:**

- `SpawnSyncReturns<Buffer | string>`: The result object containing:
  - `status`: The exit code
  - `stdout`: Standard output (Buffer or string depending on encoding option)
  - `stderr`: Standard error (Buffer or string depending on encoding option)
  - `error`: Error object if the command failed to execute
  - And other properties from [SpawnSyncReturns](https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options)

## License

MIT

## Links

- [Mutagen Documentation](https://mutagen.io/documentation)
- [Mutagen GitHub Repository](https://github.com/mutagen-io/mutagen)
