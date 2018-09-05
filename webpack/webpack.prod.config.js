var webpack = require('webpack');
const merge = require('webpack-merge');
var BundleTracker = require('webpack-bundle-tracker');
var config = require('./webpack.base.config.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OfflinePlugin = require('offline-plugin');

config.module.rules.unshift(
  { test: /\.tsx?$/, loader: 'ts-loader' },
  {
    test: /\.(s*)css$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          publicPath: '/dist/'
        }
      },
      'css-loader',
      'sass-loader'
    ]
  },
  {
    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
    use: [
      {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: '.',
          publicPath: '/dist/'
        }
      }
    ]
  }
);

module.exports = merge(config, {
  mode: 'production',
  plugins: [
    new BundleTracker({ filename: 'webpack/webpack-stats-prod.json' }),

    // removes a lot of debugging code in React
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),

    // keeps hashes consistent between compilations
    //NOT NEEDED? or ->  new (webpack.optimize.OccurenceOrderPlugin || webpack.optimize.OccurrenceOrderPlugin)()
    //new webpack.optimize.OccurenceOrderPlugin(),

    // Ignore Moment.js locales except needed
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en|es|no|nb/),

    // Add sourceMappingURL directive without generating source maps.
    new webpack.SourceMapDevToolPlugin({
      test: /.jsx?$/,
      filename: '[name]-[hash].js.map',
      append: '//# sourceMappingURL=[url]'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new OfflinePlugin({
      publicPath: '/dist/',
      appshell: '/',
      autoUpdate: 1000 * 60 * 2,
      cacheMaps: [
        {
          match: function(requestUrl) {
            return new URL('/', location);
          },
          requestTypes: ['navigate']
        }
      ],
      externals: [
        '/index.html',
        '/node_modules/react-dom/umd/react-dom.development.js',
        '/node_modules/react/umd/react.development.js'
      ],
      AppCache: {
        FALLBACK: { '/': '/index.html' }
      },
      ServiceWorker: {
        events: true,
        navigateFallbackURL: '/'
      }
    })
  ],
  devtool: 'cheap-module-source-map',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compressor: {
            warnings: false
          },
          output: {
            comments: false
          }
        }
      })
    ]
  }
});
