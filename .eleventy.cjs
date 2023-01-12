require('dotenv/config')

const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const pkg = require('./package.json')

const cp = require('child_process')

/** @param {import('@11ty/eleventy/src/UserConfig')} eleventyConfig */
module.exports = function (eleventyConfig) {
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

  eleventyConfig.addPassthroughCopy({ 'public/*.ttf': '.' })

  return {
    dir: {
      input: 'docs',
      output: 'dist',
    },
  }
}
