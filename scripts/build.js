const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Building AI Chat Sidebar Extension...');

try {
    // Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    if (fs.existsSync('out')) {
        fs.rmSync('out', { recursive: true, force: true });
    }
    if (fs.existsSync('media')) {
        fs.rmSync('media', { recursive: true, force: true });
    }

    // Install root dependencies
    console.log('📦 Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Build webview
    console.log('🔨 Building webview...');
    execSync('cd webview-ui && npm install && npm run build', { stdio: 'inherit' });

    // Compile extension backend (TypeScript)
    console.log('🔧 Compiling TypeScript...');
    execSync('npx tsc -p ./', { stdio: 'inherit' });

    console.log('✅ Build completed successfully!');
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
