var webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');
var BundleTracker = require('webpack-bundle-tracker');
var config = require('./webpack.base.config.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const GoogleFontsPlugin = require('@beyonk/google-fonts-webpack-plugin');
var path = require('path');

// Default buildType
var buildType = 'production';
if (process.argv.includes('--debug')) {
  buildType = 'development';
}

config.module.rules.unshift(
  { test: /\.tsx?$/, loader: 'ts-loader' },
  {
    test: /\.(s*)css$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          publicPath: '../app/'
        }
      },
      'css-loader',
      'sass-loader'
    ]
  }
);

module.exports = merge(config, {
  mode: buildType,
  plugins: [
    new BundleTracker({ filename: 'webpack/webpack-stats-prod.json' }),

    // removes a lot of debugging code in React
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(buildType)
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
      filename: '[name].css'
    }),
    new CopyWebpackPlugin([{
      from: 'electron/'
    }]),
    // new CopyWebpackPlugin([{
    //   from: 'react360/',
    //   to:"react360"
    // }]),
    new CopyWebpackPlugin([{
      from: 'CHANGELOG.rst',
      to:"assets/docs"
    }]),
    new GoogleFontsPlugin({
      fonts: [
          { family: "Heebo", variants:["100", "300", "400", "500", "700", "800", "900"]},
      ],
      path: "assets/fonts/",
      formats: ["ttf"]
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
      }),
        new OptimizeCSSAssetsPlugin({})
    ]
  }
});
