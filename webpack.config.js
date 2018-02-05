const path =require('path')
// 扫描文件配合消除无用css
const glob =require('glob')
// 代码压缩插件
const uglifyPlugin =require('uglifyjs-webpack-plugin')
// 配置打包过后的 index.html
const hutmlPlugin =require('html-webpack-plugin')
// 抽离css样式,防止将样式打包在js中引起页面样式加载错乱的现象
const extractTextPlugin=require('extract-text-webpack-plugin')
// 消除无用css
const PurifyCSSPlugin=require('purifycss-webpack')
// 为了使用ProvidePlugin
const webpack =require('webpack')
// 拷贝静态资源插件
const copyWebpackPlugin=require('copy-webpack-plugin')

let website={
    publicPath:''  //配置图片打包后的路径  build 是开发环境
}
if(process.env.type==='build'){
  
    website.publicPath='http://192.168.1.174:1717/'  //配置图片打包后的路径  build 是开发环境
  
}else{
    website.publicPath='http://192.168.1.174:1717/'  //配置图片打包后的路径  build 是开发环境
}
module.exports={
      devtool:'source-map', // 方便在开发阶段调试错误
      entry:{
          entry:'./src/entry.js',
          jquery:'jquery',  //抽离在配置中ProvidePlugin引入的第三方插件
          vue:'vue'
      },
      output:{
          path:path.resolve(__dirname,'dist'),
          filename:'[name].js',
          publicPath:website.publicPath  //配置图片url路径，防止打包时加载错误
      },
      module:{
          rules:[
              {
                  test: /\.css$/,
                //   use:[
                //       {
                //       loader:'style-loader'
                //       },
                //       {
                //       loader:'css-loader'
                //       },
                //    ],
                use: extractTextPlugin.extract({ // 如果配置了抽离样式，要把loader放入抽离样式中处理
                    fallback: "style-loader",
                    use: [
                        {
                            loader:"css-loader"
                        },
                        {
                            loader:'postcss-loader' //配置css加前缀
                        }
                    ]
                  })
              },
              {
                test:/\.(png|jfp|gif)/,
                use:[
                   {
                       loader:'url-loader', //url-loader里面包含了file-loader(处理图片打包后的地址让base64的和原始的是一样的,但是如果css抽离了也不能处理，需要配置publicpath)
                       options:{
                           limit:5000,  //图片大于5000直接打出来，小于就在js里面打成base64
                           outputPath:'images/'  // 让打包出来的图片在images文件下，不管是大于5000还是小于5000
                       }
                   } 
                ]
              },
              {
                 test:/\.(htm|html)$/i,
                 use:[
                     {loader:"html-withimg-loader"}  // 让在img中src引用的图片打包后也在images文件下
                 ]
              },
              {
                test: /\.less$/,
                // use:[
                //       {
                //       loader:'style-loader'
                //       },
                //       {
                //       loader:'css-loader'
                //       },
                //       {
                //       loader:'less-loader'
                //       }
                // ],
                use: extractTextPlugin.extract({ // 如果配置了抽离样式，要把loader放入抽离样式中处理
                    fallback: "style-loader",
                    use: [
                        {
                            loader:'css-loader'
                        },
                        
                        {
                            loader:'less-loader'
                        },
                        {
                            loader:'postcss-loader' //配置css加前缀 具体在postcss.config.js里配置
                        }
                    ]
                  })

              },
              {
                test: /\.scss$/,
                // use:[
                //       {
                //       loader:'style-loader'
                //       },
                //       {
                //       loader:'css-loader'
                //       },
                //       {
                //       loader:'sass-loader'
                //       }
                // ],
                use: extractTextPlugin.extract({ // 如果配置了抽离样式，要把loader放入抽离样式中处理
                    fallback: "style-loader",
                    use: [
                        {
                            loader:'css-loader'
                        },
                        {
                            loader:'sass-loader'
                        },
                        {
                            loader:'postcss-loader' //配置css加前缀
                        }
                    ]
                  })
              },
              {
                  test:/\.(jsx|js)$/, //jsx是react可以不写
                  use:[
                      {
                          loader:'babel-loader',  //使用下一代的javaScript代码(ES6,ES7….)，即使这些标准目前并未被当前的浏览器完全支持
                        //   options:{  //可能有很多，建议在.babelrc文件里面配置
                        //       presets:['es2015','react']
                        //   }
                      }
                  ],
                  exclude:/node_modules/ //去除不转换 node_modules下的文件
              }
          ]
      }, 
      plugins:[
        //  压缩代码
        new uglifyPlugin(),
        //   在配置中引入第三方库，也可以在入口js中引入。这里导入的好处:用了才会打包 ，可以抽离
        new webpack.ProvidePlugin({
           $:'jquery'
        }),
        //   配置打包过后的 index.html
        new hutmlPlugin({
            minify:{
                removeAttributeQuotes:true  //去掉attribute的引号
            },
            hash:true,  //去掉js的缓存，
            template:'./src/index.html'
        }),
        new extractTextPlugin('css/index.css'), //抽离css样式,防止将样式打包在js中引起页面样式加载错乱的现象,让打包出来的css在css文件下
        // 消除无用css
        new PurifyCSSPlugin({
            paths:glob.sync(path.join(__dirname,'src/*.html')) //扫描文件
        }),
        // 每次打包的文件都有这个注释
        new webpack.BannerPlugin('版权所以，xxxxx'),
        // 抽离第三方引入库的插件
        new webpack.optimize.CommonsChunkPlugin({
            name:['jquery','vue'],// 对应入口文件的jquery
            filename:'assets/js/[name].js', //抽离的路径
            minChunks:2

        }),
        // 拷贝静态资源
        new copyWebpackPlugin([{
            from:__dirname+'/src/public',//静态资源拷贝入口
            to:'./public'  //静态资源拷贝出口
        }]),
        // 如果热更新不成功，可以安装这个插件
        new webpack.HotModuleReplacementPlugin()
      ],
      // 热更新配置 
      devServer:{ 
          contentBase:path.resolve(__dirname,'dist'),
          host:'192.168.1.174',
          compress:true,
          port:1717
      },
    // 热打包
      watchOptions:{  
          poll:1000, // 每一分钟检查一次
          aggregateTimeout:500, //避免重复点击
          ignored:/node_modules/, //不检查这个文件下的
      }
}