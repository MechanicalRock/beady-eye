import { Lambda as AwsLambda } from 'aws-sdk'
import { endpointAddress, connectionTester } from '../interfaces'


export class LambdaConnectionTester implements connectionTester {

    lambdaFunctionName: string;
    region: string;

    constructor(lambdaFunctionName: string, region: string) {
        this.lambdaFunctionName = lambdaFunctionName;
        this.region = region;

    }

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
}

