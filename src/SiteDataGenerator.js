const fs = require('fs/promises');
const path = require('path');
const glob = require('glob-promise');
const YAML = require('yaml');
const util = require('util');
const lo = require('lodash');

function SiteDataGenerator({
  sourceDir,
  imageGenerationData,
}) {
  async function makeSiteData() {
    return {
      general: await makeGeneralContent(),
      main: await makeMainContent(),
      series: await makeSeriesDict(),
      pieces: await makePiecesDict(),
      images: makeImageDict(),
    };
  }

  async function makeGeneralContent() {
    const siteContent = await getSiteYamlContent();
    return {
      title: siteContent.site_title,
    };
  }

  async function makeMainContent() {
    const siteContent = await getSiteYamlContent();
    return {
      siteTitle: siteContent.site_title,
      seriesOrder: siteContent.series_order,
    };
  }

  async function makeSeriesDict() {
    const siteContent = await getSiteYamlContent();
    const seriesData = siteContent.series.map((s) => ({
      title: s.title,
      name: nameSquash(s.title),
      pieces: s.pieces.map(nameSquash),
    }));
    return lo.keyBy(seriesData, (s) => s.name);
  }

  // For all piece.yml files, make a pieceData object and key by piece name
  async function makePiecesDict() {
    const yamlPaths = await fetchAllYamlFilesOfType('piece');
    const pieceData = await Promise.all(yamlPaths.map(createPieceData));
    return lo.keyBy(pieceData, (p) => p.name);
  }

  function makeImageDict() {
    return lo.keyBy(imageGenerationData, (i) => i.name);
  }

  // Associates a piece with all image files in the dir of the yamlPath.
  // Image order is determined by numbers in the image name.
  async function createPieceData(yamlPath) {
    const pieceContent = await readYaml(yamlPath);
    const imagePaths = await getImagePathsForDir(yamlPath);
    const pieceImages = imagePaths
      .map((p) => imageGenerationData[p])
      .sort((a, b) => imagePriority(a) - imagePriority(b))
      .map((i) => i.name);

    return {
      title: pieceContent.title,
      name: nameSquash(pieceContent.title),
      main: pieceImages[0],
      images: pieceImages,
    };
  }

  function imagePriority(image) {
    const priorityMatch = image.name.match(/\d+/);
    return priorityMatch ? priorityMatch[0] : 0;
  }

  async function getSiteYamlContent() {
    const yamlPaths = await fetchAllYamlFilesOfType('site');
    return readYaml(yamlPaths[0]);
  }

  async function fetchAllYamlFilesOfType(type) {
    return glob(`${sourceDir}/**/${type}.{yaml,yml}`, { nocase: true });
  }

  async function readYaml(yamlPath) {
    const fileContent = await fs.readFile(yamlPath, 'utf8');
    return YAML.parse(fileContent);
  }

  async function getImagePathsForDir(yamlPath) {
    return glob(
      `${path.dirname(yamlPath)}/**/*.{jpg,jpeg}`,
      { nocase: true },
    );
  }

  function nameSquash(name) {
    return name.toLowerCase().replace(/ /g, '_');
  }

  return {
    makeSiteData,
  };
}

// // dictionaries for everything
// {
//   general: {
//     title: "Jessy Lu",
//   }
//   main: {
//     siteTitle: "Jessy Lu",
//     series_order: ["series_name_1", "series_name_2", ...]
//   }
//   series: {
//     "series_name_1": {
//       title: "series_name_1",
//       pieces: ["piece_name_1", "piece_name_2", ...]
//     }
//   }
//   pieces: {
//     "piece_name_1": {
//       title: "ex",
//       main: "image_name1",
//       // images ordered by display order
//       // images[0] is always the main
//       images: ["image_name_1", "image_name_2", ...]
//     }
//   }
//   images: {
//     "image_name_1": {
//       name: "image_name_1",
//       priority: 2,
//       metadata: {
//         webp: [
//           { format: "webp", width: 200, url: "sdfsd", srcset: "sdfds", sourceType: "image/webp" }
//         ]
//       }
//     }
//   }
// }

function loggable(o) {
  return util.inspect(o, { showHidden: false, depth: null, colors: true });
}

module.exports = SiteDataGenerator;
