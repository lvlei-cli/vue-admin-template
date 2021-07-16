const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;

module.exports = {
  entry: {
    vendor: [
      "vue/dist/vue.runtime.esm.js",
      "qs",
      "axios",
      "regenerator-runtime",
    //   "core-js/library/index",
    //   "core-js/modules/es6.regexp.replace",
    //   "core-js/modules/es6.regexp.split",
      "vue-loader/lib/runtime/componentNormalizer.js"
    ]
  },
  output: {
    path: path.join(__dirname, "dll/js"),
    filename: "[name].dll.[hash:8].js",
    library: "[name]_[hash]" // vendor.dll.js中暴露出的全局变量名
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DllPlugin({
      path: path.join(__dirname, "dll/manifest", "[name]-manifest.json"),
      name: "[name]_[hash]",
      context: process.cwd()
    })
  ]
};
