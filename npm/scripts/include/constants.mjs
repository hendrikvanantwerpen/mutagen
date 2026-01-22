// Platform mapping from Go GOOS_GOARCH to NPM platform-arch
export const platformMapping = {
    'darwin_amd64': 'darwin-x64',
    'darwin_arm64': 'darwin-arm64',
    'linux_amd64': 'linux-x64',
    'linux_arm64': 'linux-arm64',
    'windows_amd64': 'win32-x64',
    'windows_arm64': 'win32-arm64',
};

// Platform packages to publish (must be published before the main package)
export const platformPackages = Object
    .values(platformMapping)
    .map(platform => `mutagen-${platform}`);

// Main package to publish last
export const mainPackage = 'mutagen';
