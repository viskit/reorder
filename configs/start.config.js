const common = require("./common.config");
const { merge } = require("webpack-merge");
const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

module.exports = merge(common, {
  entry: path.resolve(__dirname, "..", "start/index.js"),
  output: {
    filename: "index.build.js",
    path: path.resolve(__dirname, "..", "start"),
  },
  devtool: "inline-source-map",
  mode: "development",
  devServer: {
    watchContentBase: true,
    contentBase: path.join(__dirname, "..", "start"),
    compress: true,
    port: 9000,
    inline: true,
    open: true,
    host: "127.0.0.1",
  },
  watch: true,
  plugins: [
    new Dotenv(),
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
});
