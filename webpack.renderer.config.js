const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

rules.push(
  {
    test: /\.css$/,
    use: [{ loader: MiniCssExtractPlugin.loader }, { loader: 'css-loader' }],
  },
  {
    test: /\.(png|svg|jpg|jpeg|gif)$/i,
    type: 'asset/resource',
  }
);

module.exports = {
  entry: {
    main_window: './src/renderer.ts',
    settings_window: './src/settings-renderer.ts',
  },
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
