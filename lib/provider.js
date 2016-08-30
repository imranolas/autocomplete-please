const execSync = require('child_process').execSync

module.exports = {
  selector: '.source.please-build .string',
  inclusionPriority: 1,
  excludeLowerPriority: true,

  // Required: Return a promise, an array of suggestions, or null.
  getSuggestions({editor, bufferPosition, scopeDescriptor, _, activatedManually}) {
    let targetPrefix = this.getPrefix(editor, bufferPosition)
    if(targetPrefix) {
      const cwd = editor.getDirectoryPath()
      try {
        // When querying from the repo root we append a period to the prefix to force a completion
        targetPrefix = targetPrefix === '//' ? '//.' : targetPrefix
        const completions = execSync(`plz query completions --noupdate -v 0 -k ${targetPrefix}`, {cwd}).toString().split('\n')

        return completions.map(val => ({
          text: val,
          replacementPrefix: targetPrefix,
        }))
      } catch (e) {
        return []
      }
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
