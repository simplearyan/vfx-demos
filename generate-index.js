/**
 * generate-index.js
 * Hierarchical index generator for VFX Lab.
 */
const fs = require('fs');
const path = require('path');
const config = require('./_config');

const rootDir = __dirname;
const outputFile = path.join(rootDir, 'index.html');

// ─── Recursive Scanner ───────────────────────────────────────────────────────

function scanRecursive(dir, relativePath = '') {
    const items = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        if (file.isDirectory()) {
            if (file.name === 'node_modules' || file.name === '.git' || file.name === 'screenshots' || file.name === '.github') continue;
            
            const subItems = scanRecursive(path.join(dir, file.name), path.join(relativePath, file.name));
            if (subItems.length > 0) {
                items.push({
                    type: 'directory',
                    name: file.name,
                    label: file.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    path: path.join(relativePath, file.name),
                    children: subItems
                });
            }
        } else if (file.name.endsWith('.html') && file.name !== 'index.html') {
            const cleanRelPath = relativePath.replace(/\\/g, '/');
            const screenshotPathStr = cleanRelPath ? `${cleanRelPath}/${file.name.replace('.html', '.png')}` : file.name.replace('.html', '.png');
            const screenshotRel = `./screenshots/${screenshotPathStr}`;
            const screenshotAbs = path.join(rootDir, 'screenshots', relativePath, file.name.replace('.html', '.png'));
            const hasScreenshot = fs.existsSync(screenshotAbs);

            items.push({
                type: 'file',
                name: file.name,
                path: path.join(relativePath, file.name).replace(/\\/g, '/'),
                cleanName: file.name.replace('.html', '').replace(/[-_.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                screenshot: hasScreenshot ? screenshotRel : null
            });
        }
    }
    
    // Sort directories first, then files
    return items.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
}

// ─── UI Rendering ────────────────────────────────────────────────────────────

function renderHierarchy(items, depth = 0) {
    let html = '';
    
    for (const item of items) {
        if (item.type === 'directory') {
            const catInfo = config.categories[item.name] || {};
            const icon = catInfo.icon || '📁';
            const label = catInfo.label || item.label;
            const desc = catInfo.desc || '';
            
            const hasSubDirectories = item.children.some(c => c.type === 'directory');
            const hasFiles = item.children.some(c => c.type === 'file');
            
            html += `
            <div class="section depth-${depth}">
                <div class="section-header">
                    <div class="section-title-group">
                        <span class="section-icon">${icon}</span>
                        <div>
                            <h2 class="section-title">${label}</h2>
                            ${desc ? `<p class="section-desc">${desc}</p>` : ''}
                        </div>
                    </div>
                </div>
                <div class="${hasSubDirectories ? 'section-nested' : 'section-content'}">
                    ${renderHierarchy(item.children, depth + 1)}
                </div>
            </div>`;
        } else {
            // Render a card or a list item depending on view mode
            // For the generator output, we'll put both and let CSS/JS handle toggle
            html += `
            <a href="${item.path}" class="card" data-name="${item.cleanName.toLowerCase()}" target="_blank">
                <div class="card-thumb">
                    ${item.screenshot 
                        ? `<img src="${item.screenshot}" alt="${item.cleanName}" loading="lazy">`
                        : `<div class="card-thumb-placeholder"><span>🎬</span></div>`
                    }
                    <div class="card-thumb-overlay">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        Play Preview
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-name">${item.cleanName}</div>
                    <code class="card-path">${item.path}</code>
                </div>
            </a>`;
        }
    }
    
    return html;
}

function generateHTML(hierarchy) {
    const totalCount = hierarchy.reduce((acc, item) => acc + countFiles(item), 0);
    const buildDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <meta name="description" content="${config.description}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg:           #080808;
            --surface:      #121212;
            --surface-2:    #181818;
            --surface-h:    #202020;
            --border:       #252525;
            --border-h:     #353535;
            --accent:       #d4f238;
            --accent-dim:   rgba(212,242,56,0.1);
            --text:         #f0f0f0;
            --text-2:       #a0a0a0;
            --text-3:       #606060;
            --radius:       16px;
            --font:         'Outfit', system-ui, sans-serif;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background: var(--bg);
            color: var(--text);
            font-family: var(--font);
            min-height: 100vh;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
        }

        .wrapper { max-width: 1400px; margin: 0 auto; padding: 0 2rem; }

        /* ── Header ── */
        .site-header {
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(8,8,8,0.8);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border);
        }
        .header-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.25rem 0;
        }
        .logo { font-size: 1.5rem; font-weight: 700; color: #fff; text-decoration: none; }
        .logo span { color: var(--accent); }

        .search-wrap {
            position: relative;
            flex: 1;
            max-width: 400px;
            margin: 0 2rem;
        }
        .search-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-3);
            pointer-events: none;
        }
        #search {
            width: 100%;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 0.75rem 1rem 0.75rem 2.75rem;
            color: #fff;
            font-family: inherit;
            outline: none;
            transition: all 0.2s;
        }
        #search:focus { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-dim); }

        /* ── Hero ── */
        .hero { padding: 4rem 0; text-align: center; }
        .hero h1 { font-size: 4rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.04em; }
        .hero p { color: var(--text-2); font-size: 1.25rem; max-width: 600px; margin: 0 auto; }
        .hero-stats { margin-top: 1.5rem; display: flex; justify-content: center; gap: 1rem; }
        .stat-pill { background: var(--surface); border: 1px solid var(--border); padding: 0.4rem 1rem; border-radius: 999px; font-size: 0.8rem; color: var(--text-2); }

        /* ── Hierarchy Rendering ── */
        .section { margin-bottom: 4rem; }
        .section-header { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
        .section-title-group { display: flex; align-items: center; gap: 1rem; }
        .section-icon { font-size: 2rem; }
        .section-title { font-size: 1.75rem; font-weight: 700; }
        .section-desc { color: var(--text-3); font-size: 0.9rem; margin-top: 0.25rem; }

        .section-content {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 2rem;
        }

        .section-nested {
            display: flex;
            flex-direction: column;
            gap: 3rem;
        }

        /* ── Card ── */
        .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            text-decoration: none;
            color: inherit;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .card:hover {
            transform: translateY(-8px);
            border-color: var(--accent);
            box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
        }
        .card-thumb {
            position: relative;
            aspect-ratio: 16/10;
            background: var(--surface-2);
            overflow: hidden;
        }
        .card-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .card:hover .card-thumb img { transform: scale(1.05); }
        
        .card-thumb-placeholder {
            width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
            font-size: 3rem; background: linear-gradient(45deg, #111, #181818);
        }
        .card-thumb-overlay {
            position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center; gap: 0.5rem;
            color: var(--accent); font-weight: 600; font-size: 0.9rem; opacity: 0; transition: opacity 0.3s;
        }
        .card:hover .card-thumb-overlay { opacity: 1; }

        .card-body { padding: 1.25rem; }
        .card-name { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
        .card-path { font-size: 0.7rem; color: var(--text-3); font-family: monospace; }

        /* Nested section headers */
        .depth-1 .section-title { font-size: 1.25rem; color: var(--text-2); }
        .depth-1 .section-icon { font-size: 1.25rem; }
        .depth-1 .section-content { margin-left: 2rem; }

        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .section-content { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <header class="site-header">
        <div class="wrapper header-inner">
            <a href="#" class="logo">VFX<span>Lab</span></a>
            <div class="search-wrap">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="search" id="search" placeholder="Find animations…" autocomplete="off">
            </div>
            <div></div>
        </div>
    </header>

    <main class="wrapper">
        <div class="hero">
            <h1>Explorations in Motion</h1>
            <p>${config.description}</p>
            <div class="hero-stats">
                <span class="stat-pill">${totalCount} Animations</span>
                <span class="stat-pill">Hierarchical Discovery</span>
                <span class="stat-pill">Updated ${buildDate}</span>
            </div>
        </div>

        <div id="content">
            ${renderHierarchy(hierarchy)}
        </div>
    </main>

    <script>
        const searchInput = document.getElementById('search');
        const cards = document.querySelectorAll('.card');

        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            cards.forEach(card => {
                const name = card.dataset.name;
                const match = name.includes(q);
                card.style.display = match ? 'flex' : 'none';
            });
            
            // Hide empty sections
            document.querySelectorAll('.section').forEach(section => {
                const visibleInContent = Array.from(section.querySelectorAll('.card')).some(c => c.style.display !== 'none');
                section.style.display = visibleInContent ? 'block' : 'none';
            });
        });
    </script>
</body>
</html>`;
}

function countFiles(item) {
    if (item.type === 'file') return 1;
    return item.children.reduce((acc, child) => acc + countFiles(child), 0);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('🔍 Scanning VFX directory hierarchy...');
const hierarchy = scanRecursive(rootDir);
const html = generateHTML(hierarchy);

fs.writeFileSync(outputFile, html, 'utf8');
console.log(`✅ Index generated: ${outputFile}`);
