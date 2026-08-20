// Drop-in replacement for `tsdown --config tsdown.client.config.mjs`
// using esbuild + lightningcss (tsdown itself is unavailable offline).
// Replicates the client bundle: src/client/index.tsx -> lib/client.js (and
// lib-registry/client.js) wrapped in the DSH __ModuleLoader__ format.
import { createRequire } from 'node:module'
import path from 'node:path'
import { readFile } from 'node:fs/promises'

const require = createRequire(import.meta.url)
const esbuild = require('D:/WorkBuddyData/.workbuddy/binaries/node/workspace/node_modules/esbuild')
const lightningcss = require('D:/工作/AI文件/deepseek harness/dsh-better-sidebar/node_modules/lightningcss')

const platformModules = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
]

function cssPlugin(moduleId) {
  return {
    name: 'dsh-inline-css',
    setup(b) {
      b.onResolve({ filter: /\.css$/ }, (args) => {
        if (args.importer === '') return null
        const abs = path.resolve(path.dirname(args.importer), args.path)
        return { path: '\0dsh-inline:' + encodeURIComponent(abs) + '.mjs', namespace: 'dshinline' }
      })
      b.onLoad({ filter: /.*/, namespace: 'dshinline' }, async (args) => {
        const cssPath = decodeURIComponent(args.path.slice('\0dsh-inline:'.length, -4))
        const source = await readFile(cssPath)
        const result = lightningcss.transform({
          filename: cssPath,
          code: source,
          minify: true,
          cssModules: cssPath.endsWith('.module.css'),
        })
        const classes = Object.fromEntries(
          Object.entries(result.exports ?? {}).map(([k, v]) => [k, v.name]),
        )
        const css = JSON.stringify(Buffer.from(result.code).toString('utf8'))
        const tagId = JSON.stringify(`${moduleId}/${cssPath.split(/[\\/]/).pop()}`)
        const code = `
const css = ${css};
const tagId = ${tagId};
if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']') === null) {
  const tag = document.createElement('style');
  tag.dataset.plugin = ${JSON.stringify(moduleId)};
  tag.dataset.pluginCss = tagId;
  tag.textContent = css;
  document.head.appendChild(tag);
}
export default ${JSON.stringify(classes)};
`
        return { contents: code, loader: 'js' }
      })
    },
  }
}

function clientBuild(moduleId, outDir) {
  return esbuild.build({
    entryPoints: ['src/client/index.tsx'],
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    target: 'es2022',
    outfile: path.join(outDir, 'client.js'),
    jsx: 'automatic',
    external: platformModules,
    plugins: [cssPlugin(moduleId)],
    banner: { js: `window.__ModuleLoader__.load({\n  id: ${JSON.stringify(moduleId)},\n  factory: (require) => {\n    var module = { exports: {} };\n    var exports = module.exports;` },
    footer: { js: `\n    return module.exports;\n  },\n});` },
    logLevel: 'info',
  })
}

await clientBuild('dsh-better-sidebar', 'lib')
await clientBuild('dsh-external/dsh-better-sidebar', 'lib-registry')
console.log('client build done')
