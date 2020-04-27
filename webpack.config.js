const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
		profile : "./public/src/profile.js",
		login : "./public/src/login.js",
		app : "./public/src/app.js",
		signup : "./public/src/signup.js",
    check_your_email: "./public/src/check_your_email.js"
	},
  output: {
    path: path.resolve(__dirname, 'public', 'dist')
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_fnames: true,
        },
      }),
    ],
  },
};
