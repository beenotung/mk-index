# mk-index

[![npm Package Version](https://img.shields.io/npm/v/mk-index.svg?maxAge=2592000)](https://www.npmjs.com/package/mk-index)

Generate index.ts or index.js when building npm package.

## Package Info

package name on npm: `mk-index`

available cli: `gen-index` (alias), `mk-index`

### Package History

This package is renamed from `@beenotung/gen-index` to `mk-index` to keep the package name concise.

## Usage

```bash
mk-index [OPTION]... [DIRECTORY]
```

DIRECTORY is set to be `src` by default.

### Optional Options

Below message will be shown when the cli is run with `--help` option

```
--ext ts|js
               Set the file extension.
               Should be either ts or js.
               Default to be ts

--excludeDir dir_1,dir_2,...dir_n
               List of directories to skip, e.g. "internal"

--single-quote
               Generate import statement with single quote in string value.
               (Default option)
--double-quote
               Generate import statement with double quote in string value.

--semi
               Generate import statement with tailing semi colon.
               (Default option)

--no-semi
               Generate import statement without tailing semi colon.
```

### Example package.json

```json
{
  "main": "dist/index.js",
  "scripts": {
    "prebuild": "mk-index --excludeDir internal",
    "build": "tsc --outDir dist src/*.ts"
  },
  "dependencies": {
    "mk-index": "^1.2.2"
  }
}
```

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
