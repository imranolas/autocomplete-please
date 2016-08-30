const exec = require('child_process').exec
const {getPlzRoot} = require('./plz-helpers')
const fs = require('fs')
const path = require('path')

const BLACKLISTED_DIR = [
  '.git',
  'plz-out',
  'plz-cache'
]

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
    // # Whatever your prefix regex might be
    const targetRegex = /\/\/.*$/

    // # Get the text for the line up to the triggered buffer position
    const line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition])

    const match = line.match(targetRegex)
    return match ? match[0] : ''
  },

  // (optional): called _after_ the suggestion `replacementPrefix` is replaced
  // by the suggestion `text` in the buffer
  onDidInsertSuggestion({editor, triggerPosition, suggestion}) { null } ,

  // (optional): called when your provider needs to be cleaned up. Unsubscribe
  // from things, kill any processes, etc.
  dispose: () => null,
}
