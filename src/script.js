const fs = require('fs/promises');
const pug = require('pug');
const path = require('path');
// const Image = require('@11ty/eleventy-img');

const INDEX_INPUTS = {
  pageTitle: 'Jessy Lu',
};

const BUILD_DIR = path.resolve(__dirname, '../build');

// (async () => {
//   const url = 'https://images.unsplash.com/photo-1608178398319-48f814d0750c';
//   const stats = await Image(url, {
//     widths: [300],
//   });

//   console.log(stats);
// })();

// Clear build folder

async function run() {
  // Clear build dir
  await clearDir(BUILD_DIR);

  // Generate images

  // Render page
  const indexPage = pug.renderFile(path.resolve(__dirname, 'templates/index.pug'), INDEX_INPUTS);

  // Write pages to build folder
  const pagesData = [[path.resolve(BUILD_DIR, 'index.html'), indexPage]];
  await Promise.all(pagesData.map(writeFile));
}

run();

async function writeFile([filePath, fileContent]) {
  try {
    await fs.writeFile(filePath, fileContent);
  } catch (e) {
    console.error('Error writing file.', e);
  }
}

async function clearDir(dirPath) {
  try {
    if (await exists(dirPath)) {
      await fs.rm(dirPath, { recursive: true });
    }
    await fs.mkdir(dirPath, { recursive: true });
  } catch (e) {
    console.error('Error cleaning build folder', e);
  }
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (e) {
    return false;
  }
}
