'use strict';

var fs = require('fs');

// Create a mock-fs module that can load our gzipped test cases
var data = {};
fs.readdirSync('tests').forEach(function(filename) {
    filename = 'tests/' + filename;
    data['/' + filename] = fs.readFileSync(filename).toString('base64');
});
fs.writeFileSync('./dist/tests.json', JSON.stringify(data));


module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      dist: {
        files: {
            'dist/tests.js': './browser.js',
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
