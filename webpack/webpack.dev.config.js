var path = require('path');
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
var AppCachePlugin = require('appcache-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

var config = require('./webpack.base.config.js');
var localDomain;

try {
  localDomain = require('./local.domain');
} catch (e) {
    // Not local domain specified, shared on localhost
    //localDomain = "192.168.15.26";
    //localDomain = "10.0.1.56"
    localDomain = "localhost";
    //localDomain = "alesund-dev.intra.work";
}

config.entry = {
  main: [
    'webpack-dev-server/client?http://' + localDomain + ':3000',
    'webpack/hot/only-dev-server',
    path.resolve(__dirname, '../src/main/App.tsx')
  ]
};

config.output.publicPath = 'http://' + localDomain + ':3000/assets/bundles/';

config.plugins = [
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
  }),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new BundleTracker({ filename: 'webpack/webpack-stats-dev.json' }),
  new webpack.LoaderOptionsPlugin({
    debug: true
  }),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('development')
    }
  }),
  new MiniCssExtractPlugin({
    filename: '[name].css',
    chunkFilename: '[id].css'
  })
];
config.module.rules.unshift(
  {
    test: /\.tsx?$/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          babelrc: false,
          plugins: ['react-hot-loader/babel']
        }
      },
      'ts-loader'
    ],
    exclude: /node_modules/
  },
  {
    test: /\.(s*)css$/,
    use: [
      { loader: 'style-loader' },
      { loader: 'css-loader' },
      { loader: 'sass-loader' }
    ]
  }
);
config.output.path = path.resolve(__dirname, '../bundles/dev/');

config.devtool = 'eval-source-map';

module.exports = config;
module.exports.mode = 'development';
