const resolvePackage = require('../utils/resolvePackage')

exports.name = 'builtin:transformer-markdown'

exports.apply = api => {
  api.registerTransformer('md', (page, file) => {
    const { frontmatter, body } = require('../utils/parseFrontmatter')(
      file.content
    )
    Object.assign(page.attributes, frontmatter)
    transformMarkdown(
      { page, body, configDir: api.configDir },
      api.config.markdown || {}
    )
  })
}

function transformMarkdown({ page, body, configDir }, markdown) {
  const env = { Token: require('saber-markdown').Token, hoistedTags: [] }
  const md = require('saber-markdown')(
    Object.assign(
      {
        html: true,
        linkify: true,
        highlight:
          markdown.highlighter &&
          require(resolvePackage(markdown.highlighter, {
            cwd: configDir,
            prefix: 'saber-highlighter-'
          }))
      },
      markdown.options
    )
  )
  const plugins = [
    {
      resolve: require.resolve('../markdown/hoist-tags-plugin')
    },
    {
      resolve: require.resolve('../markdown/anchor-plugin'),
      options: markdown.slugify && {
        slugify: require(resolvePackage(markdown.slugify, { cwd: configDir }))
      }
    },
    {
      resolve: require.resolve('../markdown/escape-interpolations-plugin')
    },
    {
      resolve: require.resolve('../markdown/link-plugin')
    },
    {
      resolve: require.resolve('../markdown/task-list-plugin')
    },
    ...(markdown.plugins
      ? markdown.plugins.map(p => {
          if (typeof p === 'string') {
            p = { resolve: p }
          }
          p.resolve = resolvePackage(p.resolve, { cwd: configDir })
          return p
        })
      : [])
  ]
  plugins.forEach(plugin => {
    md.use(require(plugin.resolve), plugin.options)
  })
  page.content = md.render(body, env)
  page.internal.hoistedTags = env.hoistedTags
}
