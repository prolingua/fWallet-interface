//run different ports for website and api server
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  if (process.env.USE_PROXY === "true") {
    app.use(
      "/api",
      createProxyMiddleware({
        // target: "https://xapi.fantom.network",
        target:
          process.env.REACT_APP_USE === "testnet"
            ? "https://xapi.testnet.fantom.network/"
            : "https://xapi-nodee.fantom.network/",
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          "^/api": process.env.REACT_APP_USE === "testnet" ? "/api" : "/", // remove base path
        },
      })
    );
  }
};
