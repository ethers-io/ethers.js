const path = require('path');
const fs = require('fs');

exports.getPackages = () => {
  const packages = fs.readdirSync('./packages')
  return packages.map(x => path.join('packages', x));
}

exports.getManifest = (dir) => JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
