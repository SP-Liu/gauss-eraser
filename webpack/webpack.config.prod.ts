import { merge } from 'webpack-merge';
import { Configuration } from 'webpack';
import baseConfig from './webpack.config';

module.exports = merge<Configuration>(baseConfig as Configuration, {
  mode: 'production',
  target: ['web', 'es5'],
  output: {
    filename: '[name].[contenthash:8].js',
    publicPath: './',
    assetModuleFilename: '[name].[contenthash:8][ext]',
  },
});
