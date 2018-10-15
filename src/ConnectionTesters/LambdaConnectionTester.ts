import { Lambda as AwsLambda } from 'aws-sdk'
import { endpointAddress, connectionTester, connectionTesterParams, uriEndpointAddress } from '../interfaces'


export class LambdaConnectionTester implements connectionTester {

    lambdaFunctionName: string;
    region: string;

    constructor(lambdaFunctionName: string, region: string) {
        this.lambdaFunctionName = lambdaFunctionName;
        this.region = region;

    }

    /**
     * @deprecated
     * @param endpoint The endpoint to connect to
     * @param timeout_ms Timeout in milliseconds
     */
    async tryConnectionTo(endpoint: endpointAddress, timeout_ms: number = 2000): Promise<boolean> {
        // Invoke the lambda by its function name
        let lambda = new AwsLambda({ region: this.region })
        const lambdaParams = {
            FunctionName: this.lambdaFunctionName,
            InvocationType: "RequestResponse",
            Payload: JSON.stringify({
                            endpointAddress: endpoint.address,
                            endpointPort: endpoint.port,
                            connectionTimeout_ms: timeout_ms
                            })
            }

        const result = await lambda.invoke(lambdaParams).promise();
        const payload = JSON.parse(result.Payload!.toString())

        if  ( result.FunctionError === 'Unhandled' ) {
            throw new Error(`${payload.errorType}: ${payload.errorMessage}`)
        } 

        return payload.result === true;
    }

    async tryConnectionToV2(endpoint: connectionTesterParams, timeout_ms: number = 2000): Promise<boolean> {
        if( (<endpointAddress>endpoint).address ){
            return this.tryConnectionTo(<endpointAddress>endpoint, timeout_ms)
        }else{
            return this.tryConnectionToUriEndpoint(<uriEndpointAddress>endpoint, timeout_ms);
        }
    }
    
    async tryConnectionToUriEndpoint(endpoint: uriEndpointAddress, timeout_ms): Promise<boolean> {
        // Invoke the lambda by its function name
        let lambda = new AwsLambda({ region: this.region })
        const lambdaParams = {
            FunctionName: this.lambdaFunctionName,
            InvocationType: "RequestResponse",
            Payload: JSON.stringify({
                            ...endpoint,
                            connectionTimeout_ms: timeout_ms
                            })
            }

        const result = await lambda.invoke(lambdaParams).promise();
        const payload = JSON.parse(result.Payload!.toString())

        if  ( result.FunctionError === 'Unhandled' ) {
            throw new Error(`${payload.errorType}: ${payload.errorMessage}`)
        } 

        return payload.result === true;
    }
}