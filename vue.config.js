const path = require('path')
const resolve = dir => path.resolve(__dirname, dir)
const isDev = process.env.NODE_ENV === 'development'
module.exports = isDev
  ? {
      pages: {
        index: {
          entry: './src/examples/main.js',
          template: 'public/index.html',
          filename: 'index.html'
        }
      },
      devServer: { port: 8080, hot: true, open: true, disableHostCheck: true }
    }
  : {
      productionSourceMap: false,
      css: { extract: false },
      configureWebpack: {
        output: {
          filename: 'pro-layout/index.js',
          libraryTarget: 'commonjs2',
          path: path.join(__dirname, 'dist'),
          publicPath: '/'
        }
      }
    }
