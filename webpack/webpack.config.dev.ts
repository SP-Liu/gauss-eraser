import path from 'path';
import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.config';

module.exports = merge<Configuration>(
  baseConfig as Configuration,
  {
    mode: 'development',
    target: ['web', 'es5'],
    output: {
      filename: '[name].js',
    },
    stats: 'errors-only',
    devtool: 'eval-source-map',
    devServer: {
      allowedHosts: 'all',
      port: 8088,
      open: 'index.html?img=.%2Ftest.jpg',
      hot: true,
      historyApiFallback: true,
      static: {
        directory: path.resolve(__dirname, '../public'),
      },
    },
  } as Configuration,
);
