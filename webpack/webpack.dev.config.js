var path = require('path');
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
var OfflinePlugin = require('offline-plugin');
var config = require('./webpack.base.config.js');
var localDomain;

try {
  localDomain = require('./local.domain');
} catch (e) {
  // Not local domain specified, shared on localhost
  localDomain = "192.168.15.26";
  //localDomain = "10.0.1.56"
  //localDomain = 'localhost';
  //localDomain = "alesund-dev.intra.work";
}

config.entry = {
  main: [
    'webpack-dev-server/client?http://' + localDomain + ':3000',
    'webpack/hot/only-dev-server',
    path.resolve(__dirname, '../src/main/App.tsx')
  ]
};

config.output.publicPath = 'http://' + localDomain + ':3000/';

config.plugins = [
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
  }),
  new OfflinePlugin({
    appShell: '/',
    ServiceWorker: {
      events: true
    },
    externals: [
      '/',
      '/node_modules/react-dom/umd/react-dom.development.js',
      '/node_modules/react/umd/react.development.js'
    ]
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
