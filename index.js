#!/usr/bin/env node
let fs = require('fs');
let util = require('util');
let path = require('path');

let readdir = util.promisify(fs.readdir);
let writeFile = util.promisify(fs.writeFile);

let dir = 'src';
let ext = 'ts';
let excludeDirs = [];
let singleQuote = false;
let semicolon = true;
for (let i = 2; i < process.argv.length;) {
  let param = process.argv[i];
  i++;
  if (param === '--ext') {
    ext = process.argv[i];
    if (!ext) {
      console.error(`missing ext after --ext`);
      process.exit(1);
    }
    i++;
    continue;
  }
  if (param === '--excludeDir') {
    let dirs = process.argv[i]
    if (!dirs) {
      console.error(`missing dirs after --excludeDir`)
      process.exit(1)
    }
    excludeDirs = dirs.split(',')
    i++;
    continue
  }
  if (param === '--single-quote') {
    singleQuote = true;
    continue;
  }
  if (param === '--double-quote') {
    singleQuote = false;
    continue;
  }
  if (param === '--semi') {
    semicolon = true;
    continue;
  }
  if (param === '--no-semi') {
    semicolon = false;
    continue;
  }
  if (param === '--help') {
    console.log(`Usage: mk-index [OPTION]... [DIRECTORY]
Generate index.ts or index.js when building npm package.

DIRECTORY is set to be src by default.

Optional Options:
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

Exit status:
 0  if Ok,
 1  if encountered problems.`);
    process.exit(0);
  }
  dir = param;
}

async function isDirectory(path) {
  return new Promise((resolve) =>
    fs.readdir(path, err => err ? resolve(false) : resolve(true)),
  );
}

let files = [];

async function scanDir(dir, name = dir) {
  if (excludeDirs.includes(name)) {
    return
  }
  console.debug('scan:', dir);
  let names = await readdir(dir);
  let ps = names.map(async name => {
    let child = path.join(dir, name);
    if (await isDirectory(child)) {
      /* directory */
      return scanDir(child, name);
    } else {
      /* file */
      if ([
        '.d.ts',
        '.test.ts',
        '.test.js',
        '.spec.ts',
        '.spec.js',
        '.macro.ts',
        '.macro.js',
      ].some(ext => name.endsWith(ext))) {
        // skip non-source-code files
        return;
      }
      let ref;
      if (name.endsWith('.ts')) {
        ref = name.replace(/\.ts$/, '');
      } else if (name.endsWith('.js')) {
        ref = name.replace(/\.js/, '');
      }
      if (ref && ref !== 'index') {
        files.push(dir + '/' + ref);
      }
    }
  });
  await Promise.all(ps);
}

async function main(dir) {
  await scanDir(dir);
  let out = files
    .sort()
    .map(name => {
      if (name.startsWith(dir + '\\')) {
        name = name.replace(dir + '\\', './');
      } else {
        name = name.replace(dir, '.');
      }
      let file = JSON.stringify(name);
      if (singleQuote) {
        file = file.replace(/"/g, '\'');
      }
      let code = `export * from ${file}`;
      if (semicolon) {
        code += ';';
      }
      return code;
    })
    .join('\n') + '\n'
  ;
  let filename = path.join(dir, 'index.' + ext);
  console.debug('write:', filename);
  await writeFile(filename, out);
}

main(dir)
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
;
