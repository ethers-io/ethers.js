
module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      dist: {
        files: {
            'dist/ethers-tests.js': './browser.js',
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
