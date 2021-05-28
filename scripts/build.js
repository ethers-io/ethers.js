#!/usr/bin/env node
const execa = require('execa');
const { getPackages, getManifest } = require('./utils');

(async () => {
  try {
    const packages = getPackages();
    const buildResults = packages.map(async pkg => {
      const manifest = getManifest(pkg);

      if (manifest.scripts && manifest.scripts.build && !manifest.private) {
        console.log('> Building', manifest.name);
        try {
          await execa(
            'npm run',
            ['build'],
            {
              localDir: './',
              cwd: pkg,
            }
          );
        } catch (error) {
          console.error('> Build failed', manifest.name);
          throw error;
        }
      }
    });
    await Promise.all(buildResults);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
