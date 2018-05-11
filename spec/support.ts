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

// Test case data
export const testVpc  = {
    name: "testVPC";
    region: "eu-west-1";
    emptyVpcResult: { Vpcs: [] };
    validVpcResult: { Vpcs: [ { VpcId: "12345"} ] };
    emptyVpcEndpointResult: { VpcEndpoints: [] };
    validVpcEndpointResult: { VpcEndpoints: [ { Value: "Fake"} ] };
    emptyEC2EndpointResult: { Reservations: [] };
    validEC2EndpointResult: { Reservations: [ { Instances: [ { Value: "Fake"} ] } ] };
}