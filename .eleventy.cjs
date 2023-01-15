require('dotenv/config')

const markdown = require('markdown-it')
const markdownAnchor = require('markdown-it-anchor')
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const pkg = require('./package.json')

const cp = require('child_process')

const md = markdown({
  html: true,
  breaks: false,
  linkify: false,
})
md.disable('code')
md.use(markdownAnchor)

/** @param {import('@11ty/eleventy/src/UserConfig')} eleventyConfig */
module.exports = function (eleventyConfig) {
  eleventyConfig.setLibrary('md', md)
  eleventyConfig.addPlugin(syntaxHighlight)

  eleventyConfig.addShortcode('pkgVersion', () => pkg.version)
  eleventyConfig.addShortcode(
    'production',
    () => process.env.NODE_ENV !== 'development'
  )
  eleventyConfig.addWatchTarget('./library/')

  eleventyConfig.on('eleventy.before', () => {
    cp.execFileSync('./scripts/build-library.sh')
  })

  eleventyConfig.addPassthroughCopy({ public: '.' })

  return {
    dir: {
      input: 'docs',
      output: 'dist',
    },
  }
}
