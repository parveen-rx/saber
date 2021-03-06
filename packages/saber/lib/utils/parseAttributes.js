const parser = require('@babel/parser')
const traverse = require('@babel/traverse')
const generator = require('@babel/generator')

module.exports = (content, filepath) => {
  const ast = parser.parse(content, {
    sourceFilename: filepath,
    sourceType: 'module',
    plugins: ['typescript', 'jsx', 'objectRestSpread', 'classProperties']
  })

  let attributes = {}

  traverse.default(ast, {
    ObjectExpression(path) {
      const isAttributes =
        path.parent &&
        path.parent.type === 'VariableDeclarator' &&
        path.parent.id.name === 'attributes'
      const isConstAttributes =
        isAttributes &&
        path.parentPath.parent &&
        path.parentPath.parent.kind === 'const'
      const isExportedConstAttributes =
        isConstAttributes &&
        path.parentPath.parentPath &&
        path.parentPath.parentPath.parent.type === 'ExportNamedDeclaration'
      if (isExportedConstAttributes) {
        const { confident, value } = path.evaluate()
        if (confident) {
          attributes = value
          path.node.properties = []
        } else {
          throw new Error(
            `"attributes" is supposed to have the same value when executed in runtime and build time.`
          )
        }
      }
    }
  })

  const { code } = generator.default(ast)

  return {
    attributes,
    code
  }
}
