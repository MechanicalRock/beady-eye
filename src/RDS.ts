import { RDS as AwsRDS } from "aws-sdk";
import { ConnectableAWSService, IamRole } from "./ConnectableAWSService";
import { endpointAddress } from "./interfaces";

export class RDS extends ConnectableAWSService {
  matchingDbData: AwsRDS.DBInstance;

  constructor(name: string, region: string, role?: IamRole) {
    super("RDS", AwsRDS, name, region, role);
  }

  // Function required by base class to contruct AWS client object
  makeClientType(params) {
    return new AwsRDS(params);
  }

  async shouldExist() {
    // Query the object via the client instance
    const result = await this.queryWithFilter(
      "describeDBInstances",
      "db-instance-id"
    );
    if (result && result.DBInstances && result.DBInstances[0]) {
      // Store matching VPC data
      this.matchingDbData = result.DBInstances[0];

      return result.DBInstances.length == 1;
    }

    return false;
  }

  async shouldHavePropertyValue(propName, propValue) {
    const result = await this.queryWithFilter(
      "describeDBInstances",
      "db-instance-id"
    );
    if (result && result.DBInstances && result.DBInstances[0]) {
      const instance = result.DBInstances[0];

      if (instance.DBInstanceIdentifier == this.name) {
        if (instance.hasOwnProperty(propName)) {
          return instance[propName] == propValue;
        }
      }
    }

    return false;
  }

  async getAddress(): Promise<endpointAddress | null> {
    if (this.matchingDbData === undefined) {
      if ((await this.shouldExist()) === false) return null;
    }

    const address: endpointAddress = {
      address: this.matchingDbData!.Endpoint!.Address!,
      port: this.matchingDbData!.Endpoint!.Port!,
    };
    return address;
  }
}
