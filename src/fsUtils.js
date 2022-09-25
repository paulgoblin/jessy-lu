const fs = require('fs/promises');
const path = require('path');
const util = require('util');

async function clearDir(buildDir, { ignorePath }) {
  if (!(await exists(buildDir))) {
    await fs.mkdir(buildDir);
    return;
  }

  const files = await fs.readdir(buildDir);
  await Promise.all(
    files
      .map((f) => path.resolve(buildDir, f))
    // don't clear images, because they are slow to regenerate.
      .filter((f) => !f.includes(ignorePath))
      .map((f) => fs.rm(path.resolve(buildDir, f), { recursive: true })),
  );
}

async function writeFile(filePath, fileContent) {
  try {
    await fs.writeFile(filePath, fileContent);
  } catch (e) {
    console.error(`Error writing to ${filePath}`, e);
    console.error('Stack Trace:\n', new Error().stack);
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

function loggable(o) {
  return util.inspect(o, { showHidden: false, depth: 4, colors: true });
}

module.exports = {
  clearDir,
  writeFile,
  exists,
  loggable,
};
