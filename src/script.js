const pug = require('pug');
const path = require('path');
const fs = require('fs/promises');
const { clearDir, writeFile, loggable } = require('./fsUtils');
const SiteDataGenerator = require('./SiteDataGenerator');
const ImageGenerator = require('./ImageGenerator');

const BUILD_DIR = path.resolve(__dirname, '../build');
const BUILD_IMG_DIR = path.resolve(BUILD_DIR, 'img');
const CONTENT_SOURCE_DIR = path.resolve('/Users/michaelrichter/Sites/jessy-lu/source_content');

const CONFIG = {
  sourceDir: CONTENT_SOURCE_DIR,
  outputDir: BUILD_IMG_DIR,
  sizes: {
    // icon: 50,
    micro: 150,
    thumb: 300,
    medium: 600,
    // large: 1000,
  },
};

async function buildSite() {
  // Clear build dir (excluding /img files)
  await clearDir(BUILD_DIR, { ignorePath: BUILD_IMG_DIR });

  // Generate images (if they don't exist already)
  const imageGenerationData = await ImageGenerator(CONFIG).generateImages();
  // Generate site data based on yamls.
  const siteData = await SiteDataGenerator({
    ...CONFIG,
    imageGenerationData,
  }).makeSiteData();
  console.log('Site Data', loggable(siteData));

  // Render page
  const indexPage = pug.renderFile(
    path.resolve(__dirname, 'templates/index.pug'),
    { siteData, pretty: true },
  );
  const detailPages = Object.values(siteData.pieces).map((p) => ({
    path: p.name,
    content: pug.renderFile(
      path.resolve(__dirname, 'templates/detail.pug'),
      { siteData, pieceName: p.name, pretty: true },
    ),
  }));

  // Write pages to build folder
  await Promise.all([
    writeFile(path.resolve(BUILD_DIR, 'index.html'), indexPage),
    ...detailPages.map((d) => writeFile(path.resolve(BUILD_DIR, `${d.path}.html`), d.content)),
    fs.copyFile(path.resolve(__dirname, 'assets/styles.css'), path.resolve(BUILD_DIR, 'styles.css')),
    fs.copyFile(path.resolve(__dirname, 'assets/index.js'), path.resolve(BUILD_DIR, 'index.js')),
  ]);
}

(async function execute() {
  await time(buildSite)();
}());

function time(fn) {
  return async (...args) => {
    const t0 = performance.now();
    const result = await fn(...args);
    const t1 = performance.now();
    console.log('\x1b[36m%s\x1b[0m', `${fn.name} runtime: ${Math.floor(t1 - t0)} ms`);
    return result;
  };
}
