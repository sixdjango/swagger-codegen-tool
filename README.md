# <img src="https://raw.githubusercontent.com/swagger-api/swagger.io/wordpress/images/assets/SWC-logo-clr.png" height="80">

<div align="center">

[![npm version](https://img.shields.io/npm/v/swagger-codegen-tool.svg?style=flat-square)](https://www.npmjs.org/package/swagger-codegen-tool)
[![code coverage](https://img.shields.io/coveralls/mzabriskie/axios.svg?style=flat-square)](https://coveralls.io/r/mzabriskie/axios)
[![install size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=swagger-codegen-tool&query=$.install.pretty&label=install%20size&style=flat-square)](https://packagephobia.now.sh/result?p=swagger-codegen-tool)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/swagger-codegen-tool?style=flat-square)](https://bundlephobia.com/package/swagger-codegen-tool@latest)
[![npm downloads](https://img.shields.io/npm/dm/swagger-codegen-tool.svg?style=flat-square)](https://npm-stat.com/charts.html?package=swagger-codegen-tool)
[![gitter chat](https://img.shields.io/gitter/room/mzabriskie/swagger-codegen-tool.svg?style=flat-square)](https://gitter.im/mzabriskie/swagger-codegen-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>


# swagger-codegen-tool
swagger-codegen-tool is a CLI tool to generate typescript/python code from swagger

## usage

```bash
npx swagger-codegen-tool generate -i xxx -l python -o xx/xx
```
or

- install
```bash
npm i swagger-codegen-tool -g
```
- start
```bash
swagger-codegen-tool -i <swagger-json> -l <lang> -o <output (optional)>
```

> Currently only support python lang pares form swagger-api, There may be versions of swagger that are not compatible.

> This is a swagger parser for internal use.

> If you find any problems while using, you are welcome to submit pr.

## 📖 help
```bash
swagger-codegen-tool --help
```
### 

## 🤔 roadmap
- [x] python parse
- [ ] typescript

## 💁 Contributing
If you find any problems while using, you are welcome to submit pr. or you can contact me directly by <a href="mailto:six.django@gmail.com">email</a>
