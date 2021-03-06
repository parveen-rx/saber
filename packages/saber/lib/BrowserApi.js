const path = require('path')
const { fs } = require('saber-utils')

module.exports = class BrowserApi extends Set {
  constructor(api) {
    super()
    this.api = api
  }

  async reload() {
    const files = [...this.values()].map((file, i) => {
      const name = `_${path.basename(file).replace(/\W/gi, '_')}_${i}`
      return {
        name,
        path: file.replace(/\\/g, '/')
      }
    })

    const output = `
      ${files.map(file => `import ${file.name} from "${file.path}"`).join('\n')}

      var themeBrowserApi
      var rTheme = require.context('#theme', false, /\\.[jt]s$/)
      rTheme.keys().forEach(function (k) {
        themeBrowserApi = rTheme(k).default
      })

      export default function (context) {
        ${files.map(file => `${file.name}(context)`).join('\n')}
        if (themeBrowserApi) {
          themeBrowserApi(context)
        }
      }`

    await fs.outputFile(
      this.api.resolveCache('extend-browser-api.js'),
      output,
      'utf8'
    )
  }
}
