const Image = require('@11ty/eleventy-img');
const fs = require('fs/promises');
const path = require('path');
const lo = require('lodash');
const glob = require('glob-promise');
const { exists } = require('./fsUtils');

const FORMAT = 'webp';
// Cache in the build/img folder, so it gets cleared automatically when we restart the script
const GENERATION_METADATA_CACHE = path.resolve(__dirname, '../build/img/.generation-metadata-cache.json');

function ImageGenerator({
  sourceDir,
  outputDir,
  sizes,
}) {
  function baseName(imgsrc) {
    const extension = path.extname(imgsrc);
    return path.basename(imgsrc, extension).toLowerCase().replace(/ /g, '_');
  }

  function getOutputName(imgsrc, width) {
    const size = lo.invert(sizes)[width];
    const base = baseName(imgsrc);
    return `${base}-${size}.${FORMAT}`;
  }

  // Cache layer around "generateImages" method :)
  async function generateImages() {
    if (await exists(GENERATION_METADATA_CACHE)) {
      console.log(`Cache hit at: ${GENERATION_METADATA_CACHE}`);
      const cachedJson = await fs.readFile(GENERATION_METADATA_CACHE);
      return JSON.parse(cachedJson);
    }
    const result = await actuallyGenerateImages();
    await fs.mkdir(path.dirname(GENERATION_METADATA_CACHE), { recursive: true });
    await fs.writeFile(GENERATION_METADATA_CACHE, JSON.stringify(result));
    return result;
  }

  // Generates multiple servable images for all images in sourceDir
  async function actuallyGenerateImages() {
    const imagePaths = await glob(`${sourceDir}/**/*.{jpg,jpeg}`, { nocase: true });
    const generationMetadata = await Promise.all(imagePaths.map(buildImage));

    // map each image to metadata containing all size/format combos
    return generationMetadata.reduce((agg, imageMetadata, i) => ({
      ...agg,
      [imagePaths[i]]: {
        imageName: baseName(imagePaths[i]),
        imageMetadata,
      },
    }), {});
  }

  // Convert a single image from imgsrc to output images for each size/format combo
  function buildImage(imgsrc) {
    return Image(imgsrc, {
      widths: Object.values(sizes),
      formats: [FORMAT],
      outputDir,
      filenameFormat(_, src, width, format) {
        return getOutputName(src, width, format);
      },
    });
  }

  return {
    generateImages,
  };
}

module.exports = ImageGenerator;
