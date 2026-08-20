import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { transform } from 'lightningcss'

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
    enforce: 'pre',
    resolveId(source, importer) {
      if (!source.endsWith('.css') || importer === undefined) return null
      return `\0dsh-inline:${encodeURIComponent(fileURLToPath(new URL(source, `file:///${importer.replaceAll('\\', '/')}`)))}.mjs`
    },
    async load(id) {
      if (!id.startsWith('\0dsh-inline:')) return null
      const cssPath = decodeURIComponent(id.slice('\0dsh-inline:'.length, -4))
      const source = await readFile(cssPath)
      const result = transform({
        filename: cssPath,
        code: source,
        minify: true,
        cssModules: cssPath.endsWith('.module.css'),
      })
      const classes = Object.fromEntries(
        Object.entries(result.exports ?? {}).map(([key, value]) => [key, value.name]),
      )
      const css = JSON.stringify(Buffer.from(result.code).toString('utf8'))
      const tagId = JSON.stringify(`${moduleId}/${cssPath.split(/[\\/]/).pop()}`)
      return { code: `
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
`, moduleType: 'js' }
    },
  }
}

function clientConfig(moduleId, outDir) {
  return {
    entry: { client: 'src/client/index.tsx' },
    format: 'cjs',
    platform: 'browser',
    target: 'es2022',
    outDir,
    clean: false,
    dts: false,
    sourcemap: false,
    deps: { neverBundle: platformModules, alwaysBundle: ['clsx'] },
    plugins: [cssPlugin(moduleId)],
    outputOptions: {
      banner: `window.__ModuleLoader__.load({\n  id: ${JSON.stringify(moduleId)},\n  factory: (require) => {\n    var module = { exports: {} };\n    var exports = module.exports;`,
      footer: `\n    return module.exports;\n  },\n});`,
    },
  }
}

export default [
  clientConfig('dsh-better-sidebar', 'lib'),
  clientConfig('dsh-external/dsh-better-sidebar', 'lib-registry'),
]
