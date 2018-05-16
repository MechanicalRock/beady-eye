import { RDS as AwsRDS } from 'aws-sdk'
import { AWSService } from './AWSService'
import { expect } from 'chai'

export class RDS extends AWSService {

    constructor(name: string, region: string, role?: IamRole) {
        super('RDS', AwsRDS, name, region, role);
    }

    // Function required by base class to contruct AWS client object
    makeClientType(params) {
        return new AwsRDS(params);
    }

    async shouldExist() {
      // Query the object via the client instance
      const result = await this.queryWithFilter('db-instance-id')
      if (result && result.DBInstances && result.DBInstances[0]) {
        // Store matching VPC data
        this.matchingDbData = result.DBInstances[0];
  
        return result.DBInstances.length == 1;
      }

      return false;
    }

    async shouldHavePropertyValue(propName, propValue) {
      const result = await this.queryWithFilter('db-instance-id')
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


}