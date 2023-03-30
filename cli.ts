#!/usr/bin/env -S npx ts-node

import minimist from 'minimist'
import { parse } from 'path'
import { generateAll } from 'node-mavlink'
import { readFile } from 'fs/promises'
import pkg from './package.json'

async function generate(filename: string) {
  const moduleName = parse(filename).name
  const source = (await readFile(filename)).toString()
  const output = { write: (...args: any[]) => console.log(...args) }
  await generateAll(source, output, moduleName)
}

async function generateFiles(filenames: string[]) {
  for (const filename of filenames) {
    await generate(filename)
  }
}

const args = minimist(process.argv.slice(2), {
  alias: {
    'help': 'h',
    'version': 'V',
  },
  default: {
    help: false,
    version: false,
  },
  unknown(name: string) {
    if (name.startsWith('-')) {
      console.error('ERROR: unknown parameter:', name)
      process.exit(2)
    }

    return true
  }
})

if (args.version) {
  console.log(pkg.version)
  process.exit(0)
}

if (args.help) {
  console.log(`mavlink-mapping-gen v${pkg.version} by ${pkg.author}`)
  console.log('usage:')
  console.log(`  ${pkg.name} [options] definitions.xml\n`)
  console.log(`options:`)
  console.log(`  -V, --version                              # show program version and exit`)
  console.log(`  -h, --help                                 # show help and exit`)
  process.exit(0)
}

if (args._.length === 0) {
  console.error('ERROR: no input specified')
  process.exit(1)
}

generateFiles(args._)
