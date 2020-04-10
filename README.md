# gen-index
[![npm Package Version](https://img.shields.io/npm/v/@beenotung/gen-index.svg?maxAge=2592000)](https://www.npmjs.com/package/@beenotung/gen-index)

Generate index.ts or index.js when building npm package.

## Example package.json
```json
{
  "main": "dist/index.js",
  "scripts": {
    "prebuild": "gen-index",
    "build": "tsc --outDir dist src/*.ts"
  },
  "dependencies": {
    "@beenotung/gen-index": "../"
  }
}
```
