'use strict'

const path = require('path')
const webpack = require('webpack')
const TerserJSPlugin = require('terser-webpack-plugin')
const version = require('./package.json').version

const prod = process.env.NODE_ENV === 'production'

// eslint-disable-next-line max-len
const filename = `logos-webwallet-sdk${process.env.VERSIONED ? `.${version}` : ''}${prod ? '.min' : ''}.js`

module.exports = {
  entry: './src/index.js',
  mode: prod ? 'production' : 'development',
  output: {
    path: path.resolve('./webpack'),
    filename,
    chunkFilename: 'logos-webwallet-sdk.chunks.bundle.js',
    library: 'logos-webwallet-sdk',
    libraryTarget: 'umd'
  },
  node: {
    fs: 'empty',
    module: 'empty',
    dns: 'mock',
    tls: 'mock',
    child_process: 'empty',
    dgram: 'empty',
    __dirname: true,
    process: true,
    path: 'empty',
    Buffer: false,
    zlib: 'empty'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    minimizer: [
      new TerserJSPlugin({
        terserOptions: {
          mangle: { keep_classnames: true },
          compress: { keep_classnames: true },
          output: { comments: false }
        },
        parallel: true
      })
    ]
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
}
