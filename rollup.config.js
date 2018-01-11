
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';

var env = process.env.NODE_ENV
var config = {
    output: {
        format: 'umd'
        , name: 'daggy'
        , exports: 'named'
    }
    , plugins: [
        nodeResolve({
            jsnext: true
        }),
        // due to https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module
        commonjs({
            include: 'node_modules/**',
            namedExports: {
                //'node_modules/daggy/src/daggy.js': ['taggedSum']
                'node_modules/sanctuary-type-classes/index.js': ['toString']
            }
        }),
        babel({
            exclude: 'node_modules/**'
            , babelrc: false
            , "presets": [
                ["env", {
                    "useBuiltIns": false,
                    "modules": false
                }]
            ]
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(env)
        })
    ]
}

if (env === 'production') {
    config.plugins.push(
        uglify({
            compress: {
                pure_getters: true,
                unsafe: true,
                unsafe_comps: true,
                warnings: false
            }
        })
    )
}

export default config
