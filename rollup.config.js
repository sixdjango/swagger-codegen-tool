// rollup.config.js
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import addShebang from 'rollup-plugin-add-shebang'

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js', // 指定输出目录
      inlineDynamicImports: true, // 将动态导入内联
    },
    plugins: [
      addShebang({
        include: 'dist/index.esm.js',
      }),
      typescript(),
      json(),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs', // 指定输出目录
      format: 'cjs',
      inlineDynamicImports: true, // 将动态导入内联
    },
    plugins: [
      // 添加 node 开头的 hash bang, #!/usr/bin/env node
      addShebang({
        include: 'dist/index.cjs',
      }),
      typescript(),
      json(),
    ],
  },
]
