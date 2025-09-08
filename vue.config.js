const { defineConfig } = require('@vue/cli-service');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = defineConfig({
  transpileDependencies: true,
  
  devServer: {
    port: 16588
  },
  
  chainWebpack: config => {
    // 1. HTML 标题配置
    config.plugin('html').tap(args => {
      args[0].title = "管理系统";
      return args;
    });
    
    // 2. 拆分包配置
    config.optimization.splitChunks({
      chunks: 'all',
      maxSize: 244 * 1024,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        }
      }
    });
    
    // 删除所有 preload 相关配置
  },
  
  configureWebpack: {
    plugins: [
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8
      })
    ]
  }
});