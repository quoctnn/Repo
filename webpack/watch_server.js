var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.dev.config');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  inline: true,
  historyApiFallback: true,
  disableHostCheck: true,
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
}).listen(3010, '0.0.0.0', function(err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at 0.0.0.0:3010');
});
