/**
 * generate-preview.js
 * Recursive screenshot capture for VFX Lab.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const rootDir = __dirname;
const screenshotsDir = path.join(rootDir, 'screenshots');
const FORCE = process.argv.includes('--force');

// ─── Scanner ──────────────────────────────────────────────────────────────────

function scanRecursive(dir, relativePath = '') {
    const demos = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        if (file.isDirectory()) {
            if (['node_modules', '.git', 'screenshots', '.github'].includes(file.name)) continue;
            demos.push(...scanRecursive(path.join(dir, file.name), path.join(relativePath, file.name)));
        } else if (file.name.endsWith('.html') && file.name !== 'index.html') {
            demos.push({
                name: file.name,
                relDir: relativePath,
                fullPath: path.join(dir, file.name)
            });
        }
    }
    return demos;
}

// ─── Screenshot Capture ───────────────────────────────────────────────────────

async function captureScreenshots(demos) {
    if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

    const toCapture = demos.filter(demo => {
        const pngPath = path.join(screenshotsDir, demo.relDir, demo.name.replace('.html', '.png'));
        return FORCE || !fs.existsSync(pngPath);
    });

    if (toCapture.length === 0) {
        console.log('✅ All screenshots are up to date. Use --force to regenerate.');
        return;
    }

    console.log(`📸 Capturing ${toCapture.length} screenshot(s)${FORCE ? ' (forced)' : ' (new only)'}…`);

    const isCI = !!process.env.CI;

    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: isCI ? undefined : (
            process.platform === 'win32'
                ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
                : '/usr/bin/google-chrome'
        ),
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    for (const [i, demo] of toCapture.entries()) {
        const folderPath = path.join(screenshotsDir, demo.relDir);
        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

        const pngPath = path.join(folderPath, demo.name.replace('.html', '.png'));

        try {
            console.log(`  [${i + 1}/${toCapture.length}] ${path.join(demo.relDir, demo.name)}`);
            await page.goto(`file://${demo.fullPath}`, { waitUntil: 'networkidle0', timeout: 30000 });
            
            // Wait for common canvas identifiers or just let animations settle
            await new Promise(r => setTimeout(r, 1200)); 
            
            await page.screenshot({ path: pngPath, type: 'png' });
        } catch (err) {
            console.error(`  ✖ Failed: ${demo.name} — ${err.message}`);
        }
    }

    await browser.close();
    console.log(`✅ Done capturing. Skipped: ${demos.length - toCapture.length}.`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
    try {
        const demos = scanRecursive(rootDir);
        await captureScreenshots(demos);
        
        // Regenerate index to pick up new screenshots
        console.log('\n🔄 Refreshing index.html...');
        require('./generate-index');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
