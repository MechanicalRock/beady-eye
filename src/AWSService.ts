import { Credentials } from 'aws-sdk'
import { IamRole } from './IAM'

let net = require('net')

export { IamRole };

export abstract class AWSService {
    /// AWS Client base class, providing generic validation services to AWS instances
    typeName: string
    name: string
    region: string
    role: IamRole | undefined
    lazyServiceClient?: object

    constructor(typeName: string, clientType, name: string, region: string, role?: IamRole) {
        this.typeName = typeName;
        this.name = name;
        this.region = region;
        this.role = role;
    }

    // To be implemented in sub-classes
    abstract makeClientType(params): object;

    async makeClient(withRole?: IamRole) {
      const tempCreds = withRole ? await withRole.credentials() : undefined;

      // Make EC2 client from the credentials
      this.lazyServiceClient = this.makeClientType({ credentials: tempCreds, region: this.region });
      return this.lazyServiceClient;
    }

    awsClient() {
      // Return a client (or promise of a client) on which to perform VPC-related queries.
      // Under the hood, an EC2 client is required to query VPC information
      let client = this.lazyServiceClient || this.makeClient(this.role);
      return client;
    }

    async queryWithFilter(queryFunction, nameFilterKey) {
      // Query the object via the client instance
      const params = {
                        Filters: [
                          {
                            'Name': nameFilterKey,
                            'Values': [this.name]
                          } ]
                    };

      const client = await this.awsClient();
      const result = await client[queryFunction](params).promise();

      return result;
    }

    toString() {
        return `${this.typeName}: ${this.name}`;
    }

}