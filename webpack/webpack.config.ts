import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import merge from 'webpack-merge';
import { Configuration } from 'webpack';

export default merge<Configuration>({
  entry: {
    index: './src/index.ts',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  output: {
    path: path.resolve(__dirname, '../dist/'),
    clean: true,
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/,
        type: 'asset/resource',
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                [
                  '@babel/preset-env',
                  {
                    loose: true,
                    targets: {
                      chrome: '60',
                      ios: '7',
                    },
                  },
                ],
                ['@babel/preset-typescript'],
              ],
            },
          },
        ],
      },
      { test: /\.txt$/, use: 'raw-loader' },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html'),
      filename: 'index.html',
      chunks: ['index'],
    }),
  ],
});
