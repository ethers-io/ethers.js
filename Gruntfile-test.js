'use strict';

var fs = require('fs');

// Create a mock-fs module that can load our gzipped test cases
var data = {};
fs.readdirSync('tests/tests').forEach(function(filename) {
    if (!filename.match(/\.json\.gz$/)) { return; }
    filename = 'tests/tests/' + filename;
    data['/' + filename] = fs.readFileSync(filename).toString('base64');
});
fs.writeFileSync('./tests/dist/tests.json', JSON.stringify(data));


module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      dist: {
        files: {
            'tests/dist/tests.js': './tests/browser.js',
        },
        options: {
          browserifyOptions: {
            standalone: 'tests',
          },
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('dist', ['browserify']);
};
