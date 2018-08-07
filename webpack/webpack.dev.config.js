var path = require("path");
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
var config = require('./webpack.base.config.js');

var localDomain;

try {
    localDomain = require('./local.domain');
} catch (e) {
    // Not local domain specified, shared on localhost
    //localDomain = "192.168.15.13";
    localDomain = "localhost";
    //localDomain = "alesund-dev.intra.work";
}

// config.entry = {
//     main: [
//         'webpack-dev-server/client?http://' + localDomain + ':3000',
//         'webpack/hot/only-dev-server',
//         '/src/index.tsx'
//     ]
// }

config.output.publicPath = 'http://' + localDomain + ':3000/assets/bundles/';

config.plugins = [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
     new BundleTracker({filename: 'webpack/webpack-stats-dev.json'}),
     new webpack.LoaderOptionsPlugin({
         debug: true
       })
];
config.module.rules.unshift(
//      { test: /\.tsx?$/, loader: "awesome-typescript-loader" }
     {test: /\.jsx?$/, exclude: /node_modules/, loader: 'react-hot-loader/webpack'}
);
config.output.path = path.resolve(__dirname, '../bundles/dev/');

config.devtool = 'eval-source-map'

module.exports = config
module.exports.mode = 'development';
