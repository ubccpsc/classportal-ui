var path = require('path');

module.exports = {

    entry: {
        classportal: "./app/ts/App.ts"
    },
    output: {
        path: path.resolve(__dirname, "./app/build/dist/"),
        publicPath: path.resolve(__dirname, "./build/public/"),
        filename: "classportal.js"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader' or awesome-typescript-loader'.
            {test: /\.tsx?$/, loader: "awesome-typescript-loader"},
            {
                test: require.resolve("jquery-duration-picker/duration-picker"),
                loader: 'imports-loader?jQuery=jquery,$=jquery,this=>window'
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader",
                exclude: []
            }
        ]
    }
};
