let fs = require('fs')
let path = require('path')

let contents = fs.readFileSync('out.txt')
console.log(contents.toStringg())

// let readline = require('readline');

let cleanLine = line => line.replace(/^[ \+\-\`\|]*/,'').replace(/@.+$/,'')

let rl = readline.createInterface({
  input: fs.createReadStream('out.txt'),
  crlfDelay: Infinity
}).on('line', (line) => {
    console.log(`- node_modules/${cleanLine(line)}/**`)
})