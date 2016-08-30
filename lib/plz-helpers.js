const path = require('path')
const fs = require('fs')

const getPlzRoot = (filePath) => {
  if (path.basename(filePath) === '') {
    return null
  }

  const isDir = fs.statSync(filePath).isDirectory()
  const dir = isDir ? filePath : path.dirname(filePath)
  const files = new Set(fs.readdirSync(dir))
  if (files.has('.plzconfig')) {
    return dir
  }

  const parentDir = path.resolve(dir, '..')
  return getPlzRoot(parentDir)
}

module.exports = {
  getPlzRoot
}
