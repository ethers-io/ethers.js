module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      dist: {
        files: {
          'dist/ethers-wallet.js': [ 'index.js' ]
        },
        options: {
          browserifyOptions: {
            standalone: 'Wallet'
          }
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/ethers-wallet.min.js' : [ 'dist/ethers-wallet.js' ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('dist', ['browserify', 'uglify']);
};
