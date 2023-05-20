
<h1 align="center">
   <b>
        <a href="https://github.com/sixdjango/swagger-codegen-tool.git"><img src="https://raw.githubusercontent.com/swagger-api/swagger.io/wordpress/images/assets/SWC-logo-clr.png" height="80"></a><br>
    </b>
</h1>

<p align="center">swagger-codegen-tool is a CLI tool to generate typescript/python code from swagger</p>


<div align="center">

[![npm version](https://img.shields.io/npm/v/swagger-codegen-tool.svg?style=flat-square)](https://www.npmjs.org/package/swagger-codegen-tool)
[![install size](https://packagephobia.com/badge?p=swagger-codegen-tool)](https://packagephobia.com/result?p=swagger-codegen-tool)
[![npm downloads](https://img.shields.io/npm/dm/swagger-codegen-tool.svg?style=flat-square)](https://npm-stat.com/charts.html?package=swagger-codegen-tool)
[![gitter chat](https://img.shields.io/gitter/room/mzabriskie/swagger-codegen-tool.svg?style=flat-square)](https://gitter.im/mzabriskie/swagger-codegen-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## dependencies
1. Ensure `node.js` installation, `nvm` installation is recommended

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

## output

### python
After the command is executed, You can see 4 files under the current folder `codegen_api.py` `codegen_components.py` `request-session.py` `codegen_enums.py`

- `codegen_api.py`
> This is the one that contains all the apis file, **Each command is overwritten**
```python
from .request_session import provide_request_session

from . import codegen_components

from aiohttp import ClientSession


@provide_request_session
async def errorUsingGET( session: ClientSession):
    async with session.get('/error') as response:
        data:object = await response.json()
    return data
```

- `codegen_components.py`
> This is the file that contains all the models,  **Each command is overwritten**

```python
from pydantic import BaseModel
from typing import Generic, TypeVar

class BaseResponse(BaseModel):
		code: str
		message: str
```

- `request-session.py`
> Default async request file
```python
import contextlib
from functools import wraps
import aiohttp


@contextlib.asynccontextmanager
async def getClientSession():
    session = aiohttp.ClientSession()
    try:
        yield session
    except Exception as e:
        raise e
    finally:
        session.close()
```

- `codegen_enums.py`
> This is the file that contains all the enums,  **Each command is overwritten**. By determining the component name === 'AllEnumsInfo', then the enum is generated.

```python
from enum import Enum

""" description """
class XXXEnum(Enum):
	A = 'A'
	B = 'B'
	C = 'C'
	F = 'D'
```


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
