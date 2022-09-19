var pug = require('pug');
const fs = require('fs');
const path = require('path');

const INDEX_INPUTS = {
    pageTitle: 'Jessy Lu'
};

const sourceDir = path.dirname(__filename);
const buildDir = path.resolve(__dirname, "build");

const indexPage = pug.renderFile(path.resolve(sourceDir, 'templates/index.pug'), INDEX_INPUTS);

console.log("main HTML\n" + indexPage);

fs.writeFileSync(path.resolve(buildDir), indexPage, console.log);