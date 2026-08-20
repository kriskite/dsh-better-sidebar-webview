// Drop-in replacement for the host half of `tsdown` (offline).
// Builds src/index.ts -> lib/index.js (the host bundle that the desktop's
// Electron main process loads inside the Host Cordis root).
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const esbuild = require('D:/WorkBuddyData/.workbuddy/binaries/node/workspace/node_modules/esbuild')

await esbuild.build({
  entryPoints: { index: 'src/index.ts' },
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outdir: 'lib',
  // Dependencies resolved by the host environment, never bundled.
  external: [
    'ws',
    'schemastery',
    'electron',
    '@deepseek-ai/*',
    'node:fs',
    'node:fs/promises',
    'node:path',
    'node:http',
    'node:https',
    'node:stream',
    'node:crypto',
    'node:os',
    'node:url',
    'node:child_process',
    'node:module',
    'node:worker_threads',
    'node:util',
    'node:events',
    'node:buffer',
    'node:string_decoder',
    'node:zlib',
    'node:net',
    'node:tty',
    'node:readline',
    'node:assert',
    'node:querystring',
    'node:punycode',
    'node:timers',
    'node:vm',
    'node:v8',
    'node:inspector',
    'node:cluster',
    'node:console',
    'node:constants',
    'node:dgram',
    'node:diagnostics_channel',
    'node:dns',
    'node:domain',
    'node:perf_hooks',
    'node:process',
    'node:repl',
    'node:test',
    'node:trace_events',
    'node:worker_threads',
  ],
  sourcemap: false,
  logLevel: 'info',
  legalComments: 'none',
})
console.log('host build done -> lib/index.js')
