const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building AI Chat Sidebar Extension...');

try {
    const rootDir = process.cwd();
    const webviewUiDir = path.join(rootDir, 'webview-ui');
    const outDir = path.join(rootDir, 'out');
    const mediaDir = path.join(rootDir, 'media');

    // Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    if (fs.existsSync(outDir)) {
        console.log(`   - Removing ${outDir}`);
        fs.rmSync(outDir, { recursive: true, force: true });
    }
    if (fs.existsSync(mediaDir)) {
        console.log(`   - Removing ${mediaDir}`);
        fs.rmSync(mediaDir, { recursive: true, force: true });
    }

    // Install root dependencies
    console.log('📦 Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit', cwd: rootDir });

    // Build webview
    console.log('🔨 Building webview...');
    if (!fs.existsSync(webviewUiDir)) {
        throw new Error(`webview-ui directory not found at: ${webviewUiDir}`);
    }
    execSync('npm install', { stdio: 'inherit', cwd: webviewUiDir });
    execSync('npm run build', { stdio: 'inherit', cwd: webviewUiDir });

    // Compile extension backend (TypeScript)
    console.log('🔧 Compiling TypeScript...');
    execSync('npx tsc -p ./', { stdio: 'inherit', cwd: rootDir });

    console.log('✅ Build completed successfully!');
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
