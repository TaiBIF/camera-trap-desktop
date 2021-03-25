const path = require("path");

module.exports = {
  resolve: {
    extensions: [".js"],
  },
  devtool: "source-map",
  entry: "./electron/main.js",
  target: "electron-main",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  node: {
    __dirname: false,
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
};
