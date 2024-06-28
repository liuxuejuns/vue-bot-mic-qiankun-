module.exports = {
  devServer: {
    port: 1901,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },

  css: {
    extract: false
  },

  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg')

    svgRule.uses.clear()

    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
  },
  configureWebpack: {
    output: {
      // 把子应用打包成 umd 库格式
      library: `bot-[name]`,
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_bot`
    }
  },
  productionSourceMap: false
}
