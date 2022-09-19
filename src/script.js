const pug = require('pug');
const fs = require('fs');
const path = require('path');

const INDEX_INPUTS = {
  pageTitle: 'Jessy Lu',
};

const BUILD_DIR = path.resolve(__dirname, '../build');

const indexPage = pug.renderFile(path.resolve(__dirname, 'templates/index.pug'), INDEX_INPUTS);

fs.writeFileSync(path.resolve(BUILD_DIR, 'index.html'), indexPage, console.error);
