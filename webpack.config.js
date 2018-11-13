const webpack = require('webpack');

/**
 * WebPack Configuration
 */
module.exports = {
    entry: {
        app: './src/App.js',
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/web',
        libraryTarget: 'var',
        library: 'App'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
        ],
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin(),
    ],
    resolve: {
        extensions: ['.js'],
    }
};
