#!/usr/bin/env -S npx ts-node

import minimist from 'minimist'
import { parse, dirname } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { generateAll, generateMagicNumbers, Writer } from './generator'
import { readFile } from 'fs/promises'
import pkg from './package.json'

const args = minimist(process.argv.slice(2), {
  boolean: [
    'help',
    'version',
    'write',
    'magic',
  ],
  alias: {
    'help': 'h',
    'version': 'V',
    'write': 'w',
    'magic': 'm',
  },
  default: {
    help: false,
    version: false,
    write: false,
    magic: false,
  },
  unknown(name: string) {
    if (name.startsWith('-')) {
      console.error('ERROR: unknown parameter:', name)
      process.exit(2)
    }

    return true
  }
})

function print(msg: string) {
  process.stderr.write(msg)
}

function getModuleName(filename: string) {
  return parse(filename).name
}

function getOutputFileName(filename: string) {
  return filename.substring(0, filename.length - 3) + 'ts'
}

function getImportsTemplateFileName(filename: string) {
  return filename.substring(0, filename.length - 3) + 'imports.ts'
}

function getMagicNumbersFileName(filename: string) {
  return dirname(filename) + '/magic-numbers.ts'
}

async function generate(filename: string, moduleName: string) {
  print(`Generating ${filename}...`)

  const lines: string[] = []
  const importsFileName = getImportsTemplateFileName(filename)
  const imports = existsSync(importsFileName) ? readFileSync(importsFileName) : Buffer.from('')
  const source = (await readFile(filename)).toString()
  const output = { write: msg => lines.push(msg ?? '') } as Writer
  if (imports.length > 0) output.write(imports.toString())
  const { enums, commands, messages } = await generateAll(source, output, moduleName)

  print('done\n')

  return { code: lines.join('\n'), enums, commands, messages }
}

async function generateFiles(filenames: string[], write: boolean, magic: boolean) {
  const magicNumbers: Record<string, number> = {}

  function updateMagicNumbersWithNewMessages(messages: { id: string, magic?: number }[]) {
    messages.forEach(message => {
      if (message.magic !== undefined) {
        magicNumbers[message.id] = message.magic
      }
    })
  }

  for (const filename of filenames) {
    const moduleName = getModuleName(filename)
    const { code, messages } = await generate(filename, moduleName)
    updateMagicNumbersWithNewMessages(messages)

    if (write) {
      const outputFileName = getOutputFileName(filename)
      writeFileSync(outputFileName, code)
    } else {
      console.log(code)
    }
  }

  if (magic) {
    const magicNumbersFileName = getMagicNumbersFileName(filenames[0])
    print('Generating magic-numbers.ts...')
    writeFileSync(magicNumbersFileName, generateMagicNumbers(magicNumbers))
    print('done\n')
  }
}

if (args.version) {
  console.log(pkg.version)
  process.exit(0)
}

if (args.help) {
  console.log(`mavlink-mapping-gen v${pkg.version} by ${pkg.author}`)
  console.log('usage:')
  console.log(`  ${pkg.name} [options] def1.xml def2.xml ... \n`)
  console.log(`options:`)
  console.log(`  -V, --version                              # show program version and exit`)
  console.log(`  -h, --help                                 # show help and exit`)
  console.log(`  -w, --write                                # write the content to file rather than to standard output`)
  console.log(`  -m, --magic                                # generate magic-numbers.ts (implies -w)`)
  process.exit(0)
}

if (args._.length === 0) {
  console.error('ERROR: no input specified')
  process.exit(1)
}

generateFiles(args._, args.write || args._.length > 1 || args.magic, args.magic)
