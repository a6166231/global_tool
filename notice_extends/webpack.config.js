const path = require('path');

module.exports = {
    entry: './src/main.js', // 入口文件
    output: {
        filename: 'bundle.js', // 输出文件名
        path: path.resolve(__dirname, 'dist') // 输出目录
    },
    externals: [
        (context, request, callback) => {
            if (/^@?[^/]+/.test(request)) { // 匹配 package 名称
                return callback(null, `commonjs ${request}`);
            }
            callback();
        }
    ],
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader'
            }
        }]
    }
};