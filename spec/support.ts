import fs = require('fs')

const readJson = (filename) => {
    let response = fs.readFileSync(filename)
    return JSON.parse(response.toString())
}

export const awsMockCallback = (filename) => {
    let response = readJson(filename)

    return function(params,callback){
        callback(null,response)
    }
}
export const awsMockFailureCallback = (filename) => {
    let response = readJson(filename)
    return function(params,callback){
        callback(response)
    }
}
