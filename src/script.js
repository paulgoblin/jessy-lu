const pug = require('pug');
const path = require('path');
const { clearDir, writeFile } = require('./fsUtils');
const SiteDataGenerator = require('./SiteDataGenerator');

const INDEX_INPUTS = {
  pageTitle: 'Jessy Lu',
};

const BUILD_DIR = path.resolve(__dirname, '../build');
const BUILD_IMG_DIR = path.resolve(BUILD_DIR, 'img');
const TEST_IMAGE_PATH = path.resolve('/Users/michaelrichter/Sites/jessy-lu/source_images/04_Soft Screen/04b_Soft Screen II');
// Nest 1_Main/Soft Screen II.JPG

(async function execute() {
  await time(buildSite)();
}());

async function buildSite() {
  // Clear build dir (excluding /img files)
  await clearDir(BUILD_DIR, { ignorePath: BUILD_IMG_DIR });

  const siteDataGenerator = SiteDataGenerator({
    piecePaths: [TEST_IMAGE_PATH],
    outputDir: BUILD_IMG_DIR,
    sizes: {
      icon: 50,
      thumb: 300,
      medium: 600,
      large: 1000,
    },
  });
  // Generate images (if they don't exist already)
  const siteData = await siteDataGenerator.makeSiteData();
  console.log('siteData', siteData);

  // Render page
  const indexPage = pug.renderFile(path.resolve(__dirname, 'templates/index.pug'), INDEX_INPUTS);

  // Write pages to build folder
  const pagesData = [[path.resolve(BUILD_DIR, 'index.html'), indexPage]];
  await Promise.all(pagesData.map(writeFile));
}

function time(fn) {
  return async (...args) => {
    const t0 = performance.now();
    const result = await fn(...args);
    const t1 = performance.now();
    console.log('\x1b[36m%s\x1b[0m', `${fn.name} runtime: ${Math.floor(t1 - t0)} ms`);
    return result;
  };
}
