const config = {
  webpack: {
    configure: {
      output: {
        publicPath: ".",
      },
    },
  },
  devServer: {
    hot: false,
    devMiddleware: {
      writeToDisk: true,
    },
  },
};

export default config;
