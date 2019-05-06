var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, '../src/app/App.tsx'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../app')
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.scss'],
    alias: {
      '@connection': path.resolve(__dirname, '../../jsxc/jsxc/src/connection/'),
      '@ui': path.resolve(__dirname, '../../jsxc/jsxc/src/ui/'),
      '@util': path.resolve(__dirname, '../../jsxc/jsxc/src/util/'),
      '@vendor': path.resolve(__dirname, '../../jsxc/jsxc/src/vendor/'),
      '@src': path.resolve(__dirname, '../../jsxc/jsxc/src/'),
   }
  },

  module: {
    rules: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: '../app/assets/fonts'
            }
          }
        ]
      },
      {
        test: /\.(svg|gif|png|jpg|mp3|wav)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: '../app/assets/img'
            }
          }
        ]
      }
    ]
  }
  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
};
