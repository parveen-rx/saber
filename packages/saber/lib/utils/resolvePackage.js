const path = require('path')
const resolveFrom = require('resolve-from')

const LOCAL_PATH_RE = /^[./]|(^[a-zA-Z]:)/

module.exports = (input, { cwd = process.cwd(), prefix } = {}) => {
  if (LOCAL_PATH_RE.test(input)) {
    return path.resolve(cwd, input)
  }

  return path.dirname(
    resolveFrom(
      cwd,
      `${
        !prefix || input.startsWith(prefix) ? input : `${prefix}${input}`
      }/package.json`
    )
  )
}
