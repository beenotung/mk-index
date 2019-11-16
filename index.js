#!/usr/bin/env node
let fs = require('fs');
let util = require('util');
let path = require('path');

let readdir = util.promisify(fs.readdir);
let writeFile = util.promisify(fs.writeFile);

let dir = 'src';
let ext = 'ts';
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
  if (param === '--help') {
    console.log(`Usage: gen-index [OPTION]... [DIRECTORY]
Generate index.ts or index.js when building npm package.

DIRECTORY is set to be src by default.

Optional Options:
  --ext ts|js
                 Set the file extension.
                 Should be either ts or js.
                 Default to be ts

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

async function scanDir(dir) {
  console.debug('scan:', dir);
  let names = await readdir(dir);
  let ps = names.map(async name => {
    let child = path.join(dir, name);
    if (await isDirectory(child)) {
      /* directory */
      return scanDir(child);
    } else {
      /* file */
      if ([
        '.d.ts',
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
      return `export * from ${JSON.stringify(name)};`;
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
