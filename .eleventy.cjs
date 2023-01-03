const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const pkg = require('./package.json')

/** @param {import('@11ty/eleventy/src/UserConfig')} eleventyConfig */
module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)

  eleventyConfig.addShortcode('pkgVersion', () => pkg.version)

  return {
    dir: {
      input: 'docs',
      output: 'dist',
    },
  }
}
