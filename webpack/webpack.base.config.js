var path = require('path');
var AppCachePlugin = require('appcache-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, '../src/main/App.tsx'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist/')
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.scss']
  },

  module: {
    rules: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              path: path.resolve(__dirname, '../dist/')
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new AppCachePlugin({
      cache: [
        '/node_modules/react-dom/umd/react-dom.development.js',
        '/node_modules/react/umd/react.development.js'
      ],
      network: ['*'],
      //fallback: ['failwhale.jpg'],
      settings: ['prefer-online'],
      //exclude: ['file.txt', /.*\.js$/],  // Exclude file.txt and all .js files
      output: 'intrasocial.appcache'
    })
  ],
  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};
