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
    i++;
    continue;
  }
  if (param === '--help') {
    console.log(`Usage: gen-index [OPTION]... [DIRECTORY]
Generate index.ts or index.js when building npm package.

DIRECTORY is set to be src by default.

Optional Options:
  --ext ts|js
                 set the file extension,
                 should be either ts or js.

Exit status:
 0  if Ok,
 1  if encountered problems.`);
    process.exit(0)
  }
  dir = param;
}

async function isDirectory(path) {
  return new Promise((resolve) =>
    fs.readdir(path, err => err ? resolve(false) : resolve(true))
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
      let ref;
      if (name.endsWith('.ts') && !name.endsWith('.spec.ts') && !name.endsWith('.d.ts')) {
        ref = name.replace(/\.ts$/, '');
      } else if (name.endsWith('.js') && !name.endsWith('.spec.js')) {
        ref = name.replace(/\.js/, '');
      }
      if (ref && ref != 'index') {
        files.push(path.join(dir, ref));
      }
    }
  });
  await Promise.all(ps);
}

async function main(dir) {
  await scanDir(dir);
  let out = files
    .map(name => {
      name = name.replace(dir, '.');
      return `export * from ${JSON.stringify(name)};`
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
