import fs from 'node:fs'
import { isArray } from 'lodash-es'
import type { Components, Info, Path, PropertiesValue, SwaggerSchema } from './types'
import { request_session_template } from './pythonTemplate'
import { APIS_FILE_NAME, COMPONENTS_FILE_NAME, ENUMS_FILE_NAME, PYTHON_REQUEST_SESSION_FILE_NAME } from './enum'

export enum PropertiesType {
  INTEGER = 'integer',
  STRING = 'string',
  NUMBER = 'number',
  ARRAY = 'array',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  VOID = 'Void',
}

export function generatePythonCode(schema: SwaggerSchema, output?: string) {
  const { components, paths } = schema
  generatePythonClass(components, output)
  generateApi(paths, output)
}

const typeMap = {
  [PropertiesType.INTEGER]: 'int',
  [PropertiesType.NUMBER]: 'int',
  [PropertiesType.STRING]: 'str',
  [PropertiesType.ARRAY]: 'list',
  [PropertiesType.BOOLEAN]: 'bool',
  [PropertiesType.OBJECT]: 'dict',
  [PropertiesType.VOID]: 'None',
}

const generic_components = []

function drop_generics(str: string) {
  const sp = str.split('«')
  // 返回泛型
  return `${sp[0]}`
}

function get_generic_class(str: string) {
  const sp = str.split('«')
  // 返回泛型
  if (!sp[1])
    return sp[0]
  return `${sp[1].replace('»', '')}`
}

function getRefType(ref: string) {
  const sp = ref.split('/')
  return `${drop_generics(sp[sp.length - 1])}`
}

function getRealClass(ref: string) {
  const sp = ref.split('/')
  return get_generic_class(`${sp[sp.length - 1]}`)
}

function isGeneric(ref: string) {
  return ref.includes('«') || ref.includes('[')
}

function format_generic_type(type: string) {
  const sp = type.split('/')
  type = sp[sp.length - 1]
  if (isGeneric(type)) {
    const g_class = get_generic_class(type)
    const i = type.indexOf('«')
    const root_class = type.substring(0, i)
    return `${root_class}[${typeMap[g_class] ?? `${COMPONENTS_FILE_NAME}.${g_class}`}]`
  }

  return typeMap[type] ?? type
}

const api_template = `
@provide_request_session
async def {api_name}({args}session: ClientSession = None):
    async with session.{method} as response:
        data = await response.{parse}
    {response_type}

    `
function generateApi(paths: Path, output?: string) {
  const api_str_list: string[] = []
  Object.keys(paths).forEach((k) => {
    const method_obj = paths[k]
    Object.keys(method_obj).forEach((l) => {
      let t = api_template

      const method = l
      // 设置方法名称
      const { description, operationId, parameters, requestBody, responses } = method_obj[l]
      t = t.replace('{api_name}', operationId)

      if (parameters && isArray(parameters)) {
        const args_list: string[] = []
        const json_args_list: string[] = []
        parameters.forEach((e) => {
          const { schema, required } = e

          const python_type = schema.$ref ? getRefType(schema.$ref) : typeMap[schema.type]
          // 格式化参数
          args_list.push(`${e.name}: ${python_type} ${required ? '' : '=None'}`)
          json_args_list.push(`'${e.name}':${e.name}`)
        })
        const args_str = args_list.join(', ')
        const json_args_str = json_args_list.join(',')
        // 设置参数
        t = t.replace('{args}', `${args_str}, `)
        t = t.replace('{method}', `${method}('${k}',json={${json_args_str}})`)
      }
      //  请求参数是对象
      else if (requestBody) {
        // 获取对象 class
        const $ref = requestBody.content['application/json'].schema.$ref
        const python_type = format_generic_type($ref)
        // 设置参数
        t = t.replace('{args}', `data: ${COMPONENTS_FILE_NAME}.${python_type}, `)
        t = t.replace('{method}', `${method}('${k}',json=data.dict())`)
      }
      else {
        t = t.replace('{args}', '')
        t = t.replace('{method}', `${method}('${k}')`)
      }

      let response_type = ''
      if (responses) {
        const content_type_k = Object.keys(responses['200'].content)[0]
        const { schema } = responses['200'].content[content_type_k]
        const $ref = schema.$ref
        if ($ref) {
          response_type = format_generic_type($ref)
          // parse to pydantic class
          const real_class = getRealClass($ref)
          if (!typeMap[real_class] && isGeneric($ref))
            t = t.replace('{response_type}', response_type ? `resp = ${COMPONENTS_FILE_NAME}.${response_type}.parse_obj(data)\n    resp.data = ${COMPONENTS_FILE_NAME}.${real_class}(**resp.data)\n    return resp` : 'None')
          else
            t = t.replace('{response_type}', response_type ? `return ${COMPONENTS_FILE_NAME}.${response_type}.parse_obj(data)` : 'None')
        }
      }
      else {
        t = t.replace('{response_type}', response_type ? `return ${COMPONENTS_FILE_NAME}.${response_type}.parse_obj(data)` : 'None')
      }

      t = t.replace('{parse}', 'json()')
      t = `${description ? `''' ${description} '''` : ''}${t}`
      api_str_list.push(t)
    })
  })

  const session_file = `${output ?? '.'}/${PYTHON_REQUEST_SESSION_FILE_NAME}.py`

  // 首次才生成
  if (!fs.existsSync(session_file))
    fs.writeFileSync(session_file, request_session_template)
  const imports = ['""" This file is automatically generated, please do not modify """', 'from .request_session import provide_request_session', `from . import ${COMPONENTS_FILE_NAME}`, 'from aiohttp import ClientSession']
  fs.writeFileSync(`${output ?? '.'}/${APIS_FILE_NAME}.py`, [...imports, api_str_list.join('\n\n')].join('\n\n'))
}

// 生成对应的模型
function generatePythonClass(components: Components, output?: string) {
  const components_list: string[] = []
  // 泛型个数
  let generic_count = 0
  const { schemas } = components
  Object.keys(schemas).forEach((k) => {
    const { properties, description: class_description } = schemas[k]

    const getType = (v: PropertiesValue) => {
      const { type, $ref, items } = v
      let python_type = $ref ? getRefType($ref) : typeMap[type]
      if (items && python_type === 'list') {
        const list_type = getType(items)
        python_type = `list[${list_type}]`
        return python_type
      }

      return python_type
    }

    // 是否是泛型
    const is_generic_class = isGeneric(k)

    const generic_type = `T${generic_count}`
    const define_generic = `${generic_type} = TypeVar("${generic_type}")`
    const class_name = drop_generics(k)

    // 生成枚举, key 写死后期可能开放
    if (class_name === 'AllEnumsInfo')
      return generate_python_enums(schemas[k], output)

    // 已经存在的泛型就跳过
    if (generic_components.includes(class_name))
      return

    let class_name_str = `${class_description ? `""" ${class_description} """\n` : ''}class ${class_name}(${is_generic_class ? `Generic[${generic_type}], ` : ''}BaseModel):`

    if (is_generic_class) {
      generic_components.push(class_name)
      class_name_str = `${define_generic}\n${class_name_str}`
      generic_count++
    }

    const properties_list: string[] = Object.keys(properties).map((p) => {
      const { description } = properties[p]
      let python_type = getType(properties[p])

      // console.log('python_type:', python_type)
      // console.log('get_generic_class(k):', get_generic_class(k))
      // 如果是泛型则设置泛型
      if (is_generic_class && (python_type === `${get_generic_class(k)}`))
        python_type = generic_type

      if (description) {
        const fill_description = description.split('\n').map(e => `\t\t# ${e.trim()}`).join('\n')
        return `${fill_description}\n\t\t${p}: ${python_type} = None`
      }

      return `\t\t${p}: ${python_type} = None`
    })
    const final_class = [class_name_str, ...properties_list].join('\n')
    let has_push = false
    for (let i = 0; i < components_list.length; i++) {
      const e = components_list[i]
      if (e.includes(class_name)) {
        components_list.splice(i, 0, final_class)
        has_push = true
        break
      }
    }
    if (!has_push)
      components_list.push(final_class)
  })
  const imports = ['""" This file is automatically generated, please do not modify """', 'from pydantic import BaseModel', 'from typing import Generic, TypeVar']
  fs.writeFileSync(`${output ?? '.'}/${COMPONENTS_FILE_NAME}.py`, [...imports, components_list.join('\n\n')].join('\n\n'))
}

function generate_python_enums(all_enums_info: Info, output?: string) {
  const { properties } = all_enums_info
  if (properties) {
    const enums_list: string[] = []
    Object.keys(properties).forEach((k) => {
      const { enum: enum_list, description, example } = properties[k]
      const enum_name = example ?? k[0].toUpperCase() + k.slice(1)
      const enum_description = description
      const enum_str = [`${enum_description ? `""" ${enum_description} """\n` : ''}class ${enum_name}(Enum):`]
      enum_list.forEach((e: string) => {
        enum_str.push(`\t${e} = '${e}'`)
      })
      enums_list.push(enum_str.join('\n'))
    })

    const imports = ['""" This file is automatically generated, please do not modify """', 'from enum import Enum']
    fs.writeFileSync(`${output ?? '.'}/${ENUMS_FILE_NAME}.py`, [...imports, enums_list.join('\n\n')].join('\n\n'))
  }
}
