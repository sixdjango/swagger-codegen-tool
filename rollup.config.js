// rollup.config.js
import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import addShebang from 'rollup-plugin-add-shebang'

export default {
  input: 'src/index.ts',
  output: {
    // file: 'dist/bundle.cjs',
    dir: 'dist', // 指定输出目录
    format: 'cjs',
    inlineDynamicImports: true, // 将动态导入内联
  },
  plugins: [
    addShebang({
      include: 'dist/index.js',
    }),
    typescript(),
    nodeResolve({
      exportConditions: ['node'], // add node option here,
      preferBuiltins: false,
    }),

    commonjs({
      only: [/^\.{0,2}\//],
    }),
    json(),
  ],
}
