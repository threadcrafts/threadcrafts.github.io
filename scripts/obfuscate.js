/**
 * Post-build: obfuscate the algorithm chunk to deter casual copying.
 * Run after `npm run build`. Requires: npm install -D javascript-obfuscator
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist', 'assets')

const files = fs.readdirSync(distDir, { withFileTypes: true })
const algorithmFile = files.find((f) => f.isFile() && f.name.startsWith('algorithm-') && f.name.endsWith('.js'))

if (!algorithmFile) {
  console.warn('obfuscate: no algorithm-*.js chunk found in dist/assets (skipping)')
  process.exit(0)
}

let obfuscate
try {
  const mod = await import('javascript-obfuscator')
  obfuscate = mod.default
} catch {
  console.warn('obfuscate: javascript-obfuscator not installed. Run: npm install -D javascript-obfuscator')
  process.exit(0)
}

const filePath = path.join(distDir, algorithmFile.name)
const code = fs.readFileSync(filePath, 'utf8')

const result = obfuscate.obfuscate(code, {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.2,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: false,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 5,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
})

fs.writeFileSync(filePath, result.getObfuscatedCode(), 'utf8')
console.log('Obfuscated:', algorithmFile.name)
