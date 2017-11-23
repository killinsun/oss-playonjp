var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
 
module.exports = {
    entry: {
        style: 'public/stylesheets/scss/style.scss'
    },
    output: {
        path: path.join(__dirname, 'public/stylesheets/'),
        filename: '[name].css'
    },
    module: {
        loaders: [
            { 
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
            }
        ]
    },
    plugins: [
		new ExtractTextPlugin('[name].css')
    ]
};
