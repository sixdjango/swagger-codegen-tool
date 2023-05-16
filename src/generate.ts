import fetch from 'node-fetch'
import { LangType } from './enum'
import { generatePythonCode } from './generatePython'
import type { SwaggerSchema } from './types'

async function fetch_config(config_input: string) {
  const config: SwaggerSchema = await fetch(config_input)
    .then(response => response.json()) as SwaggerSchema
  console.log(config)
  return config
}

// 生成代码
export async function generateCode(config_input: string, lang: string) {
  const config = await fetch_config(config_input)
  switch (lang) {
    case LangType.PYTHON:
      generatePythonCode(config)

      break
  }
}
