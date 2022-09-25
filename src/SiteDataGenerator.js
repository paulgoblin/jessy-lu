const fs = require('fs/promises');
const path = require('path');
const glob = require('glob-promise');
const YAML = require('yaml');
const util = require('util');
const lo = require('lodash');

// TODO: allow as a config
const FORMAT = 'webp';

function SiteDataGenerator({
  sourceDir,
  imageData,
  sizes,
}) {
  function filename(filePath) {
    return path.basename(filePath, path.extname(filePath));
  }

  async function parseYaml(yamlPath) {
    const fileContent = await fs.readFile(yamlPath, 'utf8');
    const yamlContent = YAML.parse(fileContent);
    switch (filename(yamlPath)) {
      case 'piece':
        return createPieceData(yamlContent, yamlPath);
      default:
        console.log(
          `Unsupported content file name, ${filename(yamlPath)}, for file ${yamlPath}`,
        );
        return null;
    }
  }

  async function createPieceData(pieceContent, yamlPath) {
    // all images associated with the piece.yaml
    const imagePaths = await glob(
      `${path.dirname(yamlPath)}/**/*.{jpg,jpeg}`,
      { nocase: true },
    );
    return {
      ...pieceContent,
      ...createImageData(imagePaths),
    };
  }

  function addImagePriority(m) {
    const priorityMatch = m.imageName.match(/\d+/);
    return {
      ...m,
      priority: priorityMatch ? priorityMatch[0] : 0,
    };
  }

  function createImageData(imagePaths) {
    const pieceImage = imagePaths
      .map((p) => imageData[p])
      .map(addImagePriority);
    return {
      main: pieceImage.find((m) => m.priority === 0),
      images: pieceImage,
    };
  }

  async function makeSiteData() {
    const dataFile = await glob(`${sourceDir}/**/*.{yaml,yml}`, { nocase: true });
    const contentData = await Promise.all(dataFile.map(parseYaml));
    return contentData
      .filter((d) => !!d)
      .reduce((agg, pieceData) => ({
        ...agg,
        [pieceData.name]: pieceData,
      }), {});
  }

  return {
    makeSiteData,
  };
}

function loggable(o) {
  return util.inspect(o, { showHidden: false, depth: null, colors: true });
}

module.exports = SiteDataGenerator;
