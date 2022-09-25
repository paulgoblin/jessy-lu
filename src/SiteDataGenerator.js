const Image = require('@11ty/eleventy-img');
const fs = require('fs/promises');
const path = require('path');
const lo = require('lodash');
const glob = require('glob-promise');
const YAML = require('yaml');
const util = require('util');
const { exists, writeFile } = require('./fsUtils');

const FORMAT = 'webp';
// Cache in the build/img folder, so it gets cleared automatically when we restart the script
const GENERATION_METADATA_CACHE = path.resolve(__dirname, '../build/img/.generation-metadata-cache.json');

function SiteDataGenerator({
  piecePaths,
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

  function getOutputPath(imgsrc, width) {
    return path.join(outputDir, getOutputName(imgsrc, width));
  }

  function getMetadata() {
    // imagesSources.
  }

  async function parseAboutFile(piecePath) {
    // fails if no metadata file is found
    const aboutPath = path.resolve(piecePath, 'about.yml');
    const fileContent = await fs.readFile(aboutPath, 'utf8');
    const aboutData = YAML.parse(fileContent);
    const name = baseName(piecePath);
    return {
      name,
      ...aboutData,
    };
  }

  async function makeSiteData() {
    const aboutData = await parseAboutFile(piecePaths[0]);
    const imageMetadata = await maybeGenerateImagesAndRetrieveMetadata(GENERATION_METADATA_CACHE);
    return {
      [aboutData.name]: aboutData,
    };
  }

  async function findImageSourceFiles(piecePath) {
    return glob(`${piecePath}/**/*.{jpg,jpeg}`, { nocase: true });
  }

  async function maybeGenerateImagesAndRetrieveMetadata(cachePath) {
    if (await exists(cachePath)) {
      console.log(`Cache hit at: ${cachePath}`);
      const cachedJson = await fs.readFile(cachePath);
      return JSON.parse(cachedJson);
    }
    const result = await generateImages();
    await fs.writeFile(cachePath, JSON.stringify(result));
    console.log(`Writing to cache: ${cachePath}`);
    console.log(`Writing to cache: ${loggable(result)}`);
    return result;
  }

  async function generateImages() {
    const piecePath = piecePaths[0];
    const imgPaths = await findImageSourceFiles(piecePath);
    const generationMetadata = await Promise.all(imgPaths.map(buildImage));

    // map the image name to each metadata object (one metadata for each size/format combo)
    const namedMetadata = generationMetadata.map((imageMetadata, i) => ({
      imageName: baseName(imgPaths[i]),
      imageMetadata,
    }));

    // group metadata by image name, so we can easily look up available formats.
    const imageMetadata = lo.groupBy(namedMetadata, (n) => n.imageName);

    return imageMetadata;
  }

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
    makeSiteData,
  };
}

function loggable(o) {
  return util.inspect(o, { showHidden: false, depth: null, colors: true });
}

module.exports = SiteDataGenerator;
