const fs = require("fs")
const path = require("path")
const MarkdownIt = require("markdown-it")
const MarkdownItAnchor = require("markdown-it-anchor")
const uslug = require("uslug")
const rimraf = require("rimraf")

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
}).use(MarkdownItAnchor, {
  slugify: uslug
})

const sourceFolder = 'source'
const destFolder = 'r'

fs.readdir(sourceFolder, (err, fileNames) => {
  console.log(`Processing ${sourceFolder}`)

  if (err) {
    console.error(`Couldn't read source folder`, err)
    return
  }

  console.log('Loading template HTML')
  const template = fs.readFileSync("template.html", "utf8")
  console.log('Template HTML loaded')

  console.log('Cleaning up old builds')
  rimraf.sync(destFolder)
  fs.mkdirSync(destFolder)
  console.log('Cleanup done')

  console.log('Processing files')
  fileNames.forEach(filename => {
    console.log(`Processing ${filename}`)
    fs.readFile(path.join(sourceFolder, filename), 'utf-8', (err, content) => {
      if (err) {
        console.error(`Couldn't process file ${filename}`, err)
        return
      }
      
      const mdHTML = md.render(content)
      const finalHTML = template.replace(/{MD-RESULT}/g, mdHTML)
      const newFileName = path.join(destFolder, filename.replace('.md', '.html'))
      fs.writeFileSync(newFileName, finalHTML, { flag: "w" })

      // Create copy of readme.md as index.html for github.io
      if (filename === 'readme.md') {
        console.log('Processed file was readme.md, creating copy to root')
        fs.writeFileSync('index.html', finalHTML, { flag: "w" })
        console.log('File copied')
      }

      console.log(`${filename} has been processed`)
    })
  })
})
