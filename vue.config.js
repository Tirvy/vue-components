
const path = require('path');

 module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
      ? '/vue-components/'
      : '/',
    configureWebpack: {
        resolve: {
            alias: {
                'styles': path.join(__dirname, 'src/styles')
            }
        }
    }
}