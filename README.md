# 🎨 VFX Lab — Explorations in Motion

A high-performance, hierarchical portfolio showcasing 130+ canvas animations, mathematical visualizations, and procedural motion experiments.

## 🚀 Live Demo
**[View the Live Portal →](https://simplearyan.github.io/vfx-demos/)**

---

## 🏗️ Project Architecture

This repository is built for scale and organization, using a custom-engineered indexing and preview system.

### Hierarchical Discovery
Unlike flat portfolios, VFX Lab recursively scans its directory structure to maintain a natural organization:
- **Canvas Animations**: Character sketches, interactive faces, and cartoon physics.
- **Mathematical VFX**: Visualizing waves, Fourier transforms, and geometric systems.
- **GSAP Motion**: High-performance library-driven animations.
- **Procedural Animation**: Inverse Kinematics (IK) and skeletal movement.

### Automated Build Pipeline
The project utilizes a robust **GitHub Actions** workflow to ensure a "clean repository" strategy:
1. **Hierarchical Indexing**: `generate-index.js` builds a multi-level tree of all animations.
2. **CI Preview Capture**: `generate-preview.js` uses Puppeteer in a headless environment to capture screenshots of every experiment.
3. **Clean Main Branch**: The `main` branch stays lean. All generated assets (screenshots and the final index.html) are pushed exclusively to the `gh-pages` branch for hosting.

---

## 🛠️ Local Development

### Prerequisites
- Node.js (v18+)
- Google Chrome installed on your system

### Installation
```bash
# Install dependencies
# (Skips heavy browser downloads locally)
npm install
```

### Build & Preview
```bash
# Generate the index locally
npm run index

# Capture screenshots locally (uses your system Chrome)
npm run preview
```

> [!TIP]
> This project uses `puppeteer-core` principles locally to keep the installation light. It will automatically detect your local Chrome installation on Windows.

---

## ✨ Features
- **Modern UI**: Built with the **Outfit** font and a sleek, dark glassmorphic design.
- **Instant Search**: Real-time filtering across all categories and file names.
- **Full Hierarchy**: Breadcrumbs and nested sections that reflect the actual folder structure.
- **Responsive Design**: Optimized for everything from mobile phones to 4K displays.

---

Created with ❤️ by **Aryan**.
