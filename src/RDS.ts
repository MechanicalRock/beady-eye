import { RDS as AwsRDS } from 'aws-sdk'
import { AWSService, IamRole } from './AWSService'
import { expect } from 'chai'


export class RDS extends AWSService {

    matchingDbData: AwsRDS.DBInstance;

    constructor(name: string, region: string, role?: IamRole) {
        super('RDS', AwsRDS, name, region, role);
    }

    // Function required by base class to contruct AWS client object
    makeClientType(params) {
        return new AwsRDS(params);
    }

    async shouldExist() {
      // Query the object via the client instance
      const result = await this.queryWithFilter('describeDBInstances', 'db-instance-id')
      if (result && result.DBInstances && result.DBInstances[0]) {
        // Store matching VPC data
        this.matchingDbData = result.DBInstances[0];
  
        return result.DBInstances.length == 1;
      }

      return false;
    }

    async shouldHavePropertyValue(propName, propValue) {
      const result = await this.queryWithFilter('describeDBInstances', 'db-instance-id')
      if (result && result.DBInstances && result.DBInstances[0]) {
        const instance = result.DBInstances[0];

        if (instance.DBInstanceIdentifier == this.name ) {
            if (instance.hasOwnProperty(propName)) {
                return instance[propName] == propValue;
            }
        }
      }

      return false;
    }

    async canMakeConnection(timeout_ms=1000) {
        if (this.matchingDbData === undefined) {
            if (await this.shouldExist() === false) return false;
        }

        try {
            await this.tryConnection(this.matchingDbData!.Endpoint!.Port,
                                    this.matchingDbData!.Endpoint!.Address,
                                    timeout_ms);
        }
        catch (error) {
            return false;
        }

        return true;

    }

}