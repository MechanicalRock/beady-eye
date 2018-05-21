import fs = require('fs')

// Shorthand for constructing an AWS name-value-pair
export const nvp = (key, value) => ({ Name: key, Values: value});

const readJson = (filename) => {
    let response = fs.readFileSync(filename)
    return JSON.parse(response.toString())
}

export const callbackSuccessReturning = (result) => {
    return (params, callback) => callback(null, result)
}

export const callbackFailure = (result) => {
    return(params,callback) => callback(new Error(result))
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

