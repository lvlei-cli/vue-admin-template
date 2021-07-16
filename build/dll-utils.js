const rawArgv = process.argv.slice(3);
const args = require("minimist")(rawArgv);
const env = args.mode;
const fs = require("fs");
const path = require("path");

const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackTagsPlugin = require("html-webpack-tags-plugin");

function setDllConfig(config) {
  // 开发模式不打包dll
  if (env === "development") return;

  const vendorDllFilePath = path.resolve(
    __dirname,
    "./dll/manifest/vendor-manifest.json"
  );

  if (!fs.existsSync(vendorDllFilePath)) {
    console.log("\r\n");
    console.error(
      "未找到可用的DLL Mainfest，请先执行 npm run buildDll",
      vendorDllFilePath
    );
    process.exit(-1);
  }

  // 引入dll的manifest
  config.plugin("webpack.DllReferencePlugin").use(webpack.DllReferencePlugin, [
    {
      context: process.cwd(),
      manifest: require(vendorDllFilePath)
    }
  ]);

  // 复制dll.js 文件到 dist
  config.plugin("CopyWebpackPlugin.DLL").use(CopyWebpackPlugin, [
    [
      {
        from: path.resolve(__dirname, "dll/js"),
        to: path.join(config.output.get("path"), "static/dll")
      }
    ]
  ]);

  // 所有页面引入 dll.js
  config.plugin("HtmlWebpackTagsPlugin.DLL").use(HtmlWebpackTagsPlugin, [
    {
      tags: [
        {
          path: "static/dll/",
          glob: "*.js",
          globPath: path.resolve(__dirname, "dll/js")
        }
      ],
      append: false,
      publicPath: true
    }
  ]);
}

module.exports = {
  setDllConfig
};
