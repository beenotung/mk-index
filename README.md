# gen-index
[![npm Package Version](https://img.shields.io/npm/v/@beenotung/gen-index.svg?maxAge=2592000)](https://www.npmjs.com/package/@beenotung/gen-index)

Generate index.ts or index.js when building npm package.

## Example package.json
```json
{
  "name": "examples",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "scripts": {
    "prebuild": "gen-index",
    "build": "tsc --outDir dist src/*.ts"
  },
  "keywords": [],
  "author": "Beeno Tung",
  "license": "BSD-2-Clause",
  "dependencies": {
    "@beenotung/gen-index": "../"
  }
}
```