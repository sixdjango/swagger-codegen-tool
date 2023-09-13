// 获取命令行参数
import { Command } from 'commander'
import { version } from '../package.json'
import { generateCode } from './generate'

const program = new Command()

program.name('swagger-codegen-ts').description('swagger-codegen-ts is a CLI tool to generate typescript/python code from swagger').version(version)

program.command('generate').description('generate code from swagger').option('-i, --input <input>').option('-l, --lang <lang>').option('-o, --output <output>').action(async (options) => {
  await generateCode(options.input, options.lang, options.output)
})

// const option = program.opts()

// 输出命令行参数
// console.log(chalk.green(`欢迎 ${option.name}, 您的年龄是 ${option.age}`))
program.parse(process.argv)
