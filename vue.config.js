const path = require('path')
const resolve = dir => path.resolve(__dirname, dir)

module.exports =
  process.env.NODE_ENV === 'development'
    ? {
        pages: {
          index: {
            entry: './src/examples/main.js',
            template: 'public/index.html',
            filename: 'index.html'
          }
        },
        devServer: {
          port: 8080,
          hot: true,
          open: true,
          disableHostCheck: true
        }
      }
    : {
        productionSourceMap: false,

        configureWebpack: {
          output: {
            filename: 'pro-layout/index.js',
            libraryTarget: 'commonjs2',
            path: path.join(__dirname, 'dist'),
            publicPath: '/'
          }
        },
        css: {
          extract: {
            filename: 'style.css'
          }
        }
      }
