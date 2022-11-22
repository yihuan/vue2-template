const path = require('path')
const isProd = process.env.NODE_ENV === 'production'
const cdnDomain = 'https://cdn.cn'

const cdn = {
  css: [
    cdnDomain + '/static/theme/index.css',
    cdnDomain + '/static/iconfont/iconfont.css',
    cdnDomain + '/static/dhtmlxgantt@7.1.12.css'
  ],
  js: [cdnDomain + '/meishi_sdk/meishiPersonalCard.js']
}
const prodJs = [
  cdnDomain + '/static/vue@2.7.x.js',
  cdnDomain + '/static/vue-router@3.6.4.min.js',
  cdnDomain + '/static/element-ui/index.js',
  cdnDomain + '/static/dhtmlxgantt@7.1.12.js'
]
if (isProd) {
  cdn.js.push(...prodJs)
}

let externals = {
  vue: 'Vue',
  'vue-router': 'VueRouter',
  'element-ui': 'ELEMENT',
  'dhtmlx-gantt': 'dhtmlxgantt'
}

externals = isProd ? externals : {}

module.exports = {
  publicPath: '/',
  chainWebpack: (config) => {
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach((type) =>
      addStyleResource(config.module.rule('scss').oneOf(type))
    )

    config.plugin('html').tap((args) => {
      args[0].cdn = cdn
      args[0].title = '云效'
      return args
    })
  },
  configureWebpack: {
    externals
  },
  lintOnSave: process.env.NODE_ENV !== 'production' ? 'default' : false,
  devServer: {
    port: 5000,
    disableHostCheck: true
  }
}

function addStyleResource(rule) {
  rule
    .use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [path.resolve(__dirname, './src/assets/styles/var.scss')]
    })
}
