import fs from 'node:fs'
import fetch from 'node-fetch'
import { LangType } from './enum'
import { generatePythonCode } from './generatePython'
import type { SwaggerSchema } from './types'

async function fetch_config(config_input: string) {
  const config: SwaggerSchema = await fetch(config_input)
    .then(response => response.json()) as SwaggerSchema
  return config
}

// 生成代码
export async function generateCode(config_input: string, lang: string, output?: string) {
  const config = await fetch_config(config_input)
  if (!fs.existsSync(output))
    fs.mkdirSync(output)

  switch (lang) {
    case LangType.PYTHON:
      generatePythonCode(config, output)
      break
  }
}
