const path = require('path')

module.exports = {
  entry: './src/index.ts',
  mode:'production',
  devtool: 'source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  module: {
    rules: [{
			test: /\.tsx?$/,
			exclude: /node_modules/,
			use: {
				loader: 'ts-loader',
			}
    }]
  }
}