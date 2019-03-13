'use strict';

const Path = require('path')
const Webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ExtractSASS = new ExtractTextPlugin('styles/bundle.css');

module.exports = (options) => {

    let webpackConfig = {
        devtool: options.devtool,
        entry: [
            `webpack-dev-server/client?http://localhost:${options.port}`,
            'webpack/hot/dev-server',
            './src/scripts/index'
        ],
        output: {
            path: Path.join(__dirname, 'dist'),
            filename: 'scripts/bundle.js'
        },
        plugins: [
            new Webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify(options.isProduction ? 'production' : 'development')
                }
            }),
            new HtmlWebpackPlugin({
                template: './src/index.html',
                inject: false
            }),
            new CopyWebpackPlugin([
                { from: 'src/styles/critical.css', to: 'styles/critical.css' },
                { from: 'src/images', to: 'images' },
                { from: 'src/fonts', to: 'fonts' },
                { from: 'src/resume', to: 'resume' },
                { from: 'src/favicon.ico', to: '' },
                { from: 'src/favicon-16.png', to: '' },
                { from: 'src/favicon-32.png', to: '' },
                { from: 'src/favicon-48.png', to: '' },
                { from: 'src/favicon-62.png', to: '' },
                { from: 'src/favicon-96.png', to: '' },
                { from: 'src/favicon-192.png', to: '' },
                { from: 'src/share.jpg', to: '' },
                { from: 'src/robots.txt', to: '' },
            ], {
                ignore: [],
                copyUnmodified: true
            })
        ],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015']
                    }
                },
                {
                    test: /\.json$/,
                    loader: "json-loader"
                },
                {
                    test: /\.(png|woff|woff2|eot|ttf|svg|md)$/,
                    loader: 'url-loader?limit=100000'
                },
                { test: /\.(glsl|frag|vert)$/, loader: 'raw-loader', exclude: /node_modules/ },
                { test: /\.(glsl|frag|vert)$/, loader: 'glslify-loader', exclude: /node_modules/ }
            ]
        },
        // Fix for: Module not found: Error: Cannot resolve module 'fs'
        node: {
          fs: "empty"
        }
    };

    if ( options.isProduction ) {

        webpackConfig.entry = ['./src/scripts/index'];

        webpackConfig.plugins.push(
            new Webpack.optimize.OccurenceOrderPlugin(),
            new Webpack.optimize.UglifyJsPlugin({
                compressor: {
                    warnings: false
                }
            }),
            ExtractSASS
        );

        webpackConfig.module.rules.push({
            test: /\.scss$/i,
            loader: ExtractSASS.extract(['css-loader', 'sass-loader'])
        });

    }
    else {

        webpackConfig.plugins.push(
            new Webpack.HotModuleReplacementPlugin()
        );

        webpackConfig.module.rules.push({
            test: /\.scss$/i,
            loaders: ['style-loader', 'css-loader', 'sass-loader']
        }/* , {
            test: /\.js$/,
            loader: 'eslint',
            exclude: /node_modules/
        } */);

        webpackConfig.devServer = {
            contentBase: './dist',
            hot: true,
            port: options.port,
            inline: true,
            progress: true
        };
    }

    return webpackConfig;

};
