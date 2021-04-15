const conf = {
  mode: 'development',
  resolve: {
    alias: {
      process: 'process/browser',
    },
    extensions: ['.ts', '.tsx', '.js'],
    fallback: {
      url: require.resolve('url'),
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
      stream: require.resolve('stream-browserify/'),
    },
  },
  plugins: [],
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};

module.exports = conf;
