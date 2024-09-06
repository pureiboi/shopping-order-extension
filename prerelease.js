const { version } = require('./package.json');
const replaceJSONProperty = require('replace-json-property');

console.log(version)

replaceJSONProperty.replace('./extension_dist/manifest.json', "version", version);