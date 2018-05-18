import { Credentials, EC2 as AwsEC2 } from 'aws-sdk'
import { expect } from 'chai'

export class VPC {

    name: string
    region: string | undefined
    lazyEc2Client?: AwsEC2
    matchingVpcId?: string

    constructor(name: string, region?: string) {
        this.name = name;
        this.region = region;
    }

    async makeEc2Client() {
      // Make EC2 client
      this.lazyEc2Client = new AwsEC2({ region: this.region });
      return this.lazyEc2Client;
    }

    vpcClient() {
      // Return a client (or promise of a client) on which to perform VPC-related queries.
      // Under the hood, an EC2 client is required to query VPC information
      let client = this.lazyEc2Client || this.makeEc2Client();
      return client;
    }

    async shouldExist() {
      // Query the VPC via the EC2 instance
      const params = {
                        Filters: [
                          {
                            'Name': 'tag:Name',
                            'Values': [this.name]
                          } ]
                    };

      const client = await this.vpcClient();
      const result = await client.describeVpcs(params).promise();

      if (result && result.Vpcs && result.Vpcs.length) {
        // Store matching VPC data
        this.matchingVpcId = result.Vpcs[0].VpcId;
  
        return result.Vpcs.length == 1;
      }

      return false;
    }

    async shouldHaveS3Endpoint() {
      // Query that the VPC has an S3 endpoint
      // Can only satisfy this request if the VPC is available
      if (this.matchingVpcId === undefined) {
        const vpcExists = await this.shouldExist();
        if (vpcExists == false) return false;
      }

      if (this.matchingVpcId === undefined) return false;

      const params = {
                        Filters: [
                          {
                            'Name': 'vpc-id',
                            'Values': [this.matchingVpcId]
                          },
                          {
                            'Name': 'service-name',
                            'Values': [`com.amazonaws.${this.region}.s3`]
                          }]
                    };

      const client = await this.vpcClient();
      const result = await client.describeVpcEndpoints(params).promise();

      // Ensure result is a boolean, as async functions return a promise
      let queryResult: boolean = !!result && !!result.VpcEndpoints && result.VpcEndpoints.length == 1;
      return queryResult;
    }


    async shouldHaveRunningBastionInstance() {
      // Query that the VPC has a running Bastion EC2 instance
      // Can only satisfy this request if the VPC is available
      if (this.matchingVpcId === undefined) {
        const vpcExists = await this.shouldExist();
        if (vpcExists == false) return false;
      }

      // Need an extra check here otherwise TypeScript throws a compile error
      if (this.matchingVpcId === undefined) return false;

      const params = {
                        Filters: [
                          {
                            'Name': 'vpc-id',
                            'Values': [this.matchingVpcId]
                          },
                          {
                            'Name': 'tag:Name',
                            'Values': ['*bastion*']
                          }]
                    };

      const client = await this.vpcClient();
      const result = await client.describeInstances(params).promise();

      let queryResult: boolean = !!result && !!result.Reservations && result.Reservations.length == 1;
      if ( queryResult ) {
        const res = result.Reservations![0];
        if (res && res.Instances) {
          const instances = res.Instances;

          // Check instance and status
          queryResult = queryResult || (instances.length == 1);
    
          const instance = instances[0];
          queryResult = queryResult || (instance.State && instance.State.Name == "running");
    
        } else {
          queryResult = false;
        }
      }

    return queryResult;
  }

    toString() {
        return `VPC: ${this.name}`;
    }

}


