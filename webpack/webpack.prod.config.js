var webpack = require('webpack');
const merge = require('webpack-merge');
var BundleTracker = require('webpack-bundle-tracker');
var config = require('./webpack.base.config.js');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(config, {
    mode: 'production',
    plugins: [
        new BundleTracker({filename: 'webpack/webpack-stats-prod.json'}),

        // removes a lot of debugging code in React
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
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
            filename: "[name]-[hash].js.map",
            append: "//# sourceMappingURL=[url]",
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
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
        ]
    }
});
