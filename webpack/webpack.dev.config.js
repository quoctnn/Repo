var path = require('path');
const fs = require('fs');
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
var config = require('./webpack.base.config.js');
var localDomain;

try {
  
  //localDomain = '192.168.15.24';
  localDomain = require('ip').address();
  //localDomain = require('./local.domain');
} catch (e) {
  // Not local domain specified, shared on localhost
  localDomain = 'localhost';
}

let supportedLangs = fs.readdirSync(path.resolve(__dirname,'../../jsxc/jsxc/locales/')).filter(filename => {
  if (!/\.json$/.test(filename)) {
     return false;
  }

  let file = require(path.resolve(__dirname,`../../jsxc/jsxc/locales/${filename}`));

  for (let key in file.translation) {
     if (typeof file.translation[key] === 'string') {
        return true;
     }
  }

  return false;
}).map(filename => filename.replace(/\.json$/, ''));
const JS_BUNDLE_NAME = 'jsxc.bundle.js';
let buildDate = (new Date()).toDateString();
let definePluginConfig = {
  __BUILD_DATE__: JSON.stringify(buildDate),
  __BUNDLE_NAME__: JSON.stringify(JS_BUNDLE_NAME),
  __DEPENDENCIES__: "",
  __LANGS__: JSON.stringify(supportedLangs),
};

config.entry = {
  main: [
    'webpack-dev-server/client?http://' + localDomain + ':3010',
    'webpack/hot/only-dev-server',
    path.resolve(__dirname, '../src/app/App.tsx')
  ]
};

config.output.publicPath = 'http://' + localDomain + ':3010/';

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
  new webpack.DefinePlugin(definePluginConfig)
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
