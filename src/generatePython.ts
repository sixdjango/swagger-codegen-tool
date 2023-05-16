import fs from 'node:fs'
import type { Components, PropertiesValue, SwaggerSchema } from './types'

export enum PropertiesType {
  INTEGER = 'integer',
  STRING = 'string',
  NUMBER = 'number',
  ARRAY = 'array',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
}

export function generatePythonCode(schema: SwaggerSchema) {
  const { components } = schema
  generatePythonClass(components)
}

// 生成对应的模型
function generatePythonClass(components: Components) {
  const components_list: string[] = []

  const { schemas } = components
  Object.keys(schemas).forEach((k) => {
    const { properties } = schemas[k]

    const typeMap = {
      [PropertiesType.INTEGER]: 'int',
      [PropertiesType.NUMBER]: 'int',
      [PropertiesType.STRING]: 'str',
      [PropertiesType.ARRAY]: 'list',
      [PropertiesType.BOOLEAN]: 'bool',
      [PropertiesType.OBJECT]: 'dict',
    }

    const drop_generics = (str: string) => {
      const sp = str.split('«')
      return sp[0]
    }

    const getRefType = (ref: string) => {
      const sp = ref.split('/')
      return `'${drop_generics(sp[sp.length - 1])}'`
    }

    const getType = (v: PropertiesValue) => {
      const { type, format, $ref, items } = v
      let python_type = $ref ? getRefType($ref) : typeMap[type]
      if (items && python_type === 'list') {
        const list_type = getType(items)
        python_type = `list[${list_type}]`
        return python_type
      }

      return python_type
    }

    const class_name = `class ${drop_generics(k)}(BaseModel):`

    const properties_list: string[] = Object.keys(properties).map((p) => {
      const python_type = getType(properties[p])
      return `    ${p}: ${python_type}`
    })
    const final_class = [class_name, ...properties_list].join('\n')
    components_list.push(final_class)
  })
  const imports = ['from pydantic import BaseModel']
  fs.writeFileSync('./components.py', [...imports, components_list.join('\n\n')].join('\n\n'))
}
