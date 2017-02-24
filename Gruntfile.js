module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      dist: {
        files: {
            'dist/ethers.js': './index.js',
            'dist/ethers-contracts.js': './contracts/index.js',
            'dist/ethers-hdnode.js': './hdnode/index.js',
            'dist/ethers-utils.js': './utils/index.js',
            'dist/ethers-wallet.js': './wallet/index.js',
        },
        options: {
          browserifyOptions: {
            standalone: 'ethers'
          }
        },
      },
    },
    uglify: {
      dist: {
        files: {
          'dist/ethers.min.js' : [ './dist/ethers.js' ],
          'dist/ethers-contracts.min.js' : [ './dist/ethers-contracts.js' ],
          'dist/ethers-hdnode.min.js' : [ './dist/ethers-hdnode.js' ],
          'dist/ethers-utils.min.js' : [ './dist/ethers-utils.js' ],
          'dist/ethers-wallet.min.js' : [ './dist/ethers-wallet.js' ],
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('dist', ['browserify', 'uglify']);
};
