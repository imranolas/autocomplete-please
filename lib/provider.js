const exec = require('child_process').exec
const {getPlzRoot} = require('./plz-helpers')
const fs = require('fs')
const path = require('path')

const BLACKLISTED_DIR = [
  '.git',
  'plz-out',
  'plz-cache'
]

const TARGET_REGEX = /\/\/.*$/


module.exports = {
  selector: '.source.please-build .string',
  inclusionPriority: 1,
  excludeLowerPriority: true,

  // Required: Return a promise, an array of suggestions, or null.
  getSuggestions({editor, bufferPosition}) {
    let targetPrefix = this.getPrefix(editor, bufferPosition)
    if(targetPrefix) {
      const cwd = editor.getDirectoryPath()
      return new Promise(resolve => {
        if(targetPrefix === '//') {
          // Get project root directories
          const projectPath = getPlzRoot(editor.getPath())
          if (!projectPath) return null
          const dirs = fs.readdirSync(projectPath)
            .filter(file => {
              if (file.startsWith('.') || file in BLACKLISTED_DIR) return false

              const filePath = path.resolve(projectPath, file)
              return fs.statSync(filePath).isDirectory()
            })
            .map(dir => ({
              text: dir,
            }))
          return resolve(dirs)
        }

        exec( `plz query completions --noupdate -v 0 -k ${targetPrefix}`,
            {cwd},
            (err, res) => {
              if (err) return resolve([])

              const completions = res.toString()
                .split('\n')
                .map(val => ({
                  text: val,
                  replacementPrefix: targetPrefix,
                }))

              resolve(completions)
            })
      })
    }
  },

  getPrefix(editor, bufferPosition) {

    const line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition])

    const match = line.match(TARGET_REGEX)
    return match ? match[0] : ''
  },

  onDidInsertSuggestion({editor, triggerPosition, suggestion}) { null } ,

  dispose: () => null,
}
